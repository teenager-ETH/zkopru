import {
  DB,
  Deposit as DepositSql,
  Config,
  BlockStatus,
  Proposal,
  MassDeposit as MassDepositSql,
} from '@zkopru/prisma'
import { Grove, GrovePatch, Leaf } from '@zkopru/tree'
import BN from 'bn.js'
import AsyncLock from 'async-lock'
import { Bytes32, Address, Uint256 } from 'soltypes'
import { logger } from '@zkopru/utils'
import { Field } from '@zkopru/babyjubjub'
import {
  OutflowType,
  UtxoStatus,
  WithdrawalStatus,
  ZkTx,
  Utxo,
  Withdrawal,
  ZkOutflow,
} from '@zkopru/transaction'
import { ZkAccount } from '@zkopru/account'
import {
  Block,
  Header,
  VerifyResult,
  MassDeposit,
  massDepositHash,
} from './block'
import { BootstrapData } from './bootstrap'

export interface Patch {
  result: VerifyResult
  block: Bytes32
  header: Header
  prevHeader: Header
  massDeposits?: Bytes32[]
  treePatch: GrovePatch
  nullifiers?: Uint256[]
}

export class L2Chain {
  config: Config

  lock: AsyncLock

  grove: Grove

  db: DB

  constructor(db: DB, grove: Grove, config: Config) {
    this.db = db
    this.grove = grove
    this.config = config
    this.lock = new AsyncLock()
  }

  async getBlock(hash: Bytes32): Promise<Block | null> {
    const proposal = await this.db.read(prisma =>
      prisma.proposal.findOne({
        where: {
          hash: hash.toString(),
        },
        include: {
          block: true,
        },
      }),
    )
    if (!proposal || !proposal.proposalData) return null
    const tx = JSON.parse(proposal.proposalData)
    return Block.fromTx(tx, proposal.block?.verified || false)
  }

  async getProposal(hash: Bytes32) {
    const proposal = await this.db.read(prisma =>
      prisma.proposal.findOne({
        where: {
          hash: hash.toString(),
        },
        include: {
          block: true,
        },
      }),
    )
    return proposal
  }

  async getLatestVerified(): Promise<string | null> {
    const lastVerifiedProposal: Proposal | undefined = (
      await this.db.read(prisma =>
        prisma.proposal.findMany({
          where: {
            block: {
              verified: true,
            },
          },
          orderBy: {
            proposalNum: 'desc',
          },
          include: {
            block: {
              include: {
                header: true,
              },
            },
          },
          take: 1,
        }),
      )
    ).pop()
    if (lastVerifiedProposal) return lastVerifiedProposal.hash
    return null
  }

  async getDeposits(...massDeposits: MassDeposit[]): Promise<DepositSql[]> {
    const totalDeposits: DepositSql[] = []
    for (const massDeposit of massDeposits) {
      const commits = await this.db.read(prisma =>
        prisma.massDeposit.findMany({
          where: {
            merged: massDeposit.merged.toString(),
            fee: massDeposit.fee.toString(),
            includedIn: null,
          },
          orderBy: {
            blockNumber: 'asc',
          },
          take: 1,
        }),
      )
      // logger.info()
      const nonIncludedMassDepositCommit = commits.pop()
      if (!nonIncludedMassDepositCommit) {
        logger.info('faield to find mass deposit')
        logger.info(massDeposit.merged.toString())
        logger.info(`fee ${massDeposit.fee.toString()}`)
        throw Error('Failed to find the mass deposit')
      }

      const deposits = await this.db.read(prisma =>
        prisma.deposit.findMany({
          where: {
            queuedAt: nonIncludedMassDepositCommit.index,
          },
        }),
      )
      deposits.sort((a, b) => {
        if (a.blockNumber !== b.blockNumber) {
          return a.blockNumber - b.blockNumber
        }
        if (a.transactionIndex !== b.transactionIndex) {
          return a.transactionIndex - b.transactionIndex
        }
        return a.logIndex - b.logIndex
      })
      totalDeposits.push(...deposits)
    }
    return totalDeposits
  }

  async getOldestUnverifiedBlock(): Promise<{
    prevHeader?: Header
    block?: Block
  }> {
    const lastVerified = await this.getLatestVerified()
    if (!lastVerified) return {}

    const unverifiedProposals = await this.db.read(prisma =>
      prisma.proposal.findMany({
        where: {
          block: { header: { parentBlock: lastVerified }, verified: null },
        },
        orderBy: { proposalNum: 'asc' },
        take: 1,
        include: { block: true },
      }),
    )
    const unverifiedProposal = unverifiedProposals.pop()

    if (!unverifiedProposal || !unverifiedProposal.proposalData) return {}

    const lastVerifiedHeader = await this.db.read(prisma =>
      prisma.header.findOne({
        where: { hash: lastVerified },
      }),
    )
    if (!lastVerifiedHeader) throw Error('Header not exist error.')
    const prevHeader = {
      proposer: Address.from(lastVerifiedHeader.proposer),
      parentBlock: Bytes32.from(lastVerifiedHeader.parentBlock),
      metadata: Bytes32.from(lastVerifiedHeader.metadata),
      fee: Uint256.from(lastVerifiedHeader.fee),
      utxoRoot: Uint256.from(lastVerifiedHeader.utxoRoot),
      utxoIndex: Uint256.from(lastVerifiedHeader.utxoIndex),
      nullifierRoot: Bytes32.from(lastVerifiedHeader.nullifierRoot),
      withdrawalRoot: Uint256.from(lastVerifiedHeader.withdrawalRoot),
      withdrawalIndex: Uint256.from(lastVerifiedHeader.withdrawalIndex),
      txRoot: Bytes32.from(lastVerifiedHeader.txRoot),
      depositRoot: Bytes32.from(lastVerifiedHeader.depositRoot),
      migrationRoot: Bytes32.from(lastVerifiedHeader.migrationRoot),
    }
    const tx = JSON.parse(unverifiedProposal.proposalData)
    const block = Block.fromTx(tx)
    return {
      prevHeader,
      block,
    }
  }

  async applyPatch(patch: Patch) {
    logger.info('layer2.ts: applyPatch()')
    const { result, block, header, prevHeader, treePatch, massDeposits } = patch
    // Apply tree patch
    if (result === VerifyResult.INVALIDATED) {
      throw Error('Invalid result cannot make a patch')
    }
    const { utxoTreeId, withdrawalTreeId } = await this.grove.applyGrovePatch(
      treePatch,
    )
    await this.nullifyUtxos(block, treePatch.nullifiers)
    // Record the verify result
    await this.db.write(prisma =>
      prisma.block.update({
        where: { hash: block.toString() },
        data: { verified: true },
      }),
    )
    // Update mass deposits inclusion status
    if (massDeposits) {
      await this.markMassDepositsAsIncludedIn(massDeposits, block)
    }
    await this.markUtxosAsUnspent(patch.treePatch?.utxos || [])
    await this.markWithdrawalsAsUnfinalized(patch.treePatch?.withdrawals || [])
    const utxoLeafStartIndex = header.utxoIndex
      .toBN()
      .gt(prevHeader.utxoIndex.toBN())
      ? prevHeader.utxoIndex.toBN() // appending to an exising utxo tree
      : new BN(0) // started new utxo tree
    await this.updateUtxoLeafIndexes(
      utxoTreeId,
      utxoLeafStartIndex,
      patch.treePatch?.utxos || [],
    )
    const withdrawalLeafStartIndex = header.withdrawalIndex
      .toBN()
      .gt(prevHeader.withdrawalIndex.toBN())
      ? prevHeader.withdrawalIndex.toBN() // appending to an exising utxo tree
      : new BN(0) // started new utxo tree
    await this.updateWithdrawalLeafIndexes(
      withdrawalTreeId,
      withdrawalLeafStartIndex,
      patch.treePatch?.withdrawals || [],
    )
    await this.updateWithdrawalProof(patch.treePatch?.withdrawals || [])
  }

  private async markUtxosAsUnspent(utxos: Leaf<Field>[]) {
    await this.db.write(prisma =>
      prisma.utxo.updateMany({
        where: {
          hash: { in: utxos.map(utxo => utxo.hash.toUint256().toString()) },
        },
        data: { status: UtxoStatus.UNSPENT },
      }),
    )
  }

  private async markWithdrawalsAsUnfinalized(withdrawals: Leaf<BN>[]) {
    await this.db.write(prisma =>
      prisma.withdrawal.updateMany({
        where: {
          hash: {
            in: withdrawals.map(Withdrawal => Withdrawal.hash.toString()),
          },
        },
        data: { status: WithdrawalStatus.UNFINALIZED },
      }),
    )
  }

  async findMyUtxos(txs: ZkTx[], accounts: ZkAccount[]) {
    const txsWithMemo = txs.filter(tx => tx.memo)
    logger.info(`findMyNotes`)
    const myUtxos: Utxo[] = []
    for (const tx of txsWithMemo) {
      for (const account of accounts) {
        const note = account.decrypt(tx)
        logger.info(`decrypt result ${note}`)
        if (note) myUtxos.push(note)
      }
    }
    for (const tx of txs) {
      for (const account of accounts) {
        const note = account.decrypt(tx)
        logger.info(`decrypt result ${note}`)
        if (note) myUtxos.push(note)
      }
    }
    // TODO needs batch transaction
    for (const note of myUtxos) {
      const utxoSql = {
        hash: note
          .hash()
          .toUint256()
          .toString(),
        eth: note.eth.toUint256().toString(),
        pubKey: Bytes32.from(note.pubKey.toHex()).toString(),
        salt: note.salt.toUint256().toString(),
        tokenAddr: note.tokenAddr.toAddress().toString(),
        erc20Amount: note.erc20Amount.toUint256().toString(),
        nft: note.nft.toUint256().toString(),
        status: UtxoStatus.UNSPENT,
        usedFor: null,
      }
      await this.db.write(prisma =>
        prisma.utxo.upsert({
          where: { hash: utxoSql.hash },
          create: utxoSql,
          update: utxoSql,
        }),
      )
    }
  }

  async findMyWithdrawals(txs: ZkTx[], accounts: ZkAccount[]) {
    const outflows = txs.reduce(
      (acc, tx) => [
        ...acc,
        ...tx.outflow.filter(outflow =>
          outflow.outflowType.eqn(OutflowType.WITHDRAWAL),
        ),
      ],
      [] as ZkOutflow[],
    )
    const myWithdrawalOutputs: ZkOutflow[] = outflows.filter(
      outflow =>
        outflow.data &&
        outflow.data?.to.toAddress().toString() in
          accounts.map(account => account.address),
    )
    // TODO needs batch transaction
    for (const output of myWithdrawalOutputs) {
      if (!output.data) throw Error('Withdrawal does not have public data')
      const withdrawalSql = {
        hash: output.note.toUint256().toString(),
        withdrawalHash: Withdrawal.withdrawalHash(
          output.note,
          output.data,
        ).toString(),
        to: output.data.to.toAddress().toString(),
        eth: output.data.eth.toUint256().toString(),
        tokenAddr: output.data.tokenAddr.toAddress().toString(),
        erc20Amount: output.data.erc20Amount.toUint256().toString(),
        nft: output.data.nft.toUint256().toString(),
        fee: output.data.fee.toUint256().toString(),
        status: WithdrawalStatus.WITHDRAWABLE,
        usedFor: null,
      }
      await this.db.write(prisma =>
        prisma.withdrawal.upsert({
          where: { hash: withdrawalSql.hash },
          create: withdrawalSql,
          update: withdrawalSql,
        }),
      )
    }
  }

  async applyBootstrap(block: Block, bootstrapData: BootstrapData) {
    this.grove.applyBootstrap(bootstrapData)
    const blockSql = { ...block.toSqlObj(), status: BlockStatus.FINALIZED }
    const headerSql = block.getHeaderSql()
    this.db.write(prisma =>
      prisma.block.upsert({
        where: {
          hash: block.hash.toString(),
        },
        update: blockSql,
        create: {
          ...blockSql,
          proposal: {
            create: bootstrapData.proposal,
          },
          header: {
            create: headerSql,
          },
        },
      }),
    )
  }

  private async markMassDepositsAsIncludedIn(
    massDepositHashes: Bytes32[],
    block: Bytes32,
  ) {
    const nonIncluded = await this.db.read(prisma =>
      prisma.massDeposit.findMany({
        where: {
          includedIn: null,
        },
      }),
    )
    const candidates: { [index: string]: MassDepositSql } = {}
    nonIncluded.forEach(md => {
      candidates[md.index] = md
    })

    // TODO need batch query
    const indexes: string[] = []
    for (const hash of massDepositHashes) {
      for (const index of Object.keys(candidates).sort()) {
        const md = candidates[index]
        if (
          hash.eq(
            massDepositHash({
              merged: Bytes32.from(md.merged),
              fee: Uint256.from(md.fee),
            }),
          )
        ) {
          indexes.push(index)
          delete candidates[index]
          break
        }
      }
    }
    if (indexes.length !== massDepositHashes.length)
      throw Error('Number of MassDeposits is different with the block proposal')
    await this.db.write(prisma =>
      prisma.massDeposit.updateMany({
        where: { index: { in: indexes } },
        data: { includedIn: block.toString() },
      }),
    )
  }

  private async nullifyUtxos(blockHash: Bytes32, nullifiers: BN[]) {
    await this.db.write(prisma =>
      prisma.utxo.updateMany({
        where: { nullifier: { in: nullifiers.map(v => v.toString()) } },
        data: {
          status: UtxoStatus.SPENT,
          usedFor: blockHash.toString(),
        },
      }),
    )
  }

  private async updateUtxoLeafIndexes(
    utxoTreeId: string,
    startIndex: BN,
    utxos: Leaf<Field>[],
  ) {
    for (let i = 0; i < utxos.length; i += 1) {
      const index = startIndex.addn(i)
      const leaf = utxos[i]
      const { hash, shouldTrack } = leaf
      logger.debug(leaf)
      logger.debug(`hash: ${hash}, shouldTrack: ${shouldTrack}`)
      if (shouldTrack) {
        await this.db.write(prisma =>
          prisma.utxo.update({
            where: { hash: hash.toString() },
            data: {
              index: index.toString(),
              tree: { connect: { id: utxoTreeId } },
            },
          }),
        )
      }
    }
  }

  private async updateWithdrawalLeafIndexes(
    withdrawalTreeId: string,
    startIndex: BN,
    withdrawals: Leaf<BN>[],
  ) {
    for (let i = 0; i < withdrawals.length; i += 1) {
      const index = startIndex.addn(i)
      const leaf = withdrawals[i]
      const { noteHash, shouldTrack } = leaf
      if (!noteHash) throw Error('Withdrawal leaf should contain note hash')
      if (shouldTrack) {
        await this.db.write(prisma =>
          prisma.withdrawal.update({
            where: { hash: noteHash.toString() },
            data: {
              index: index.toString(),
              tree: { connect: { id: withdrawalTreeId } },
            },
          }),
        )
      }
    }
  }

  private async updateWithdrawalProof(withdrawals: Leaf<BN>[]) {
    const myWithdrawals = withdrawals.filter(w => w.shouldTrack)
    for (const withdrawal of myWithdrawals) {
      const merkleProof = await this.grove.withdrawalMerkleProof(
        withdrawal.hash,
      )
      const { noteHash } = withdrawal
      if (!noteHash) throw Error('Withdrawal does not have note hash')
      await this.db.write(prisma =>
        prisma.withdrawal.update({
          where: { hash: noteHash.toString() },
          data: {
            siblings: JSON.stringify(
              merkleProof.siblings.map(sib => sib.toString(10)),
            ),
          },
        }),
      )
    }
  }

  async getGrovePatch(block: Block): Promise<GrovePatch> {
    logger.info(`get grove patch for block ${block.hash.toString()}`)
    const header = block.hash.toString()
    const utxos: Leaf<Field>[] = []
    const withdrawals: Leaf<BN>[] = []
    const nullifiers: Field[] = []

    const deposits = await this.getDeposits(...block.body.massDeposits)
    const utxoHashes: Field[] = []
    utxoHashes.push(...deposits.map(deposit => Field.from(deposit.note)))

    const withdrawalHashes: { noteHash: Field; withdrawalHash: Uint256 }[] = []
    for (const tx of block.body.txs) {
      for (const outflow of tx.outflow) {
        logger.debug(`outflow type ${outflow.outflowType.toString()}`)
        if (outflow.outflowType.eqn(OutflowType.UTXO)) {
          utxoHashes.push(outflow.note)
        } else if (outflow.outflowType.eqn(OutflowType.WITHDRAWAL)) {
          if (!outflow.data) throw Error('Withdrawal should have public data')
          withdrawalHashes.push({
            noteHash: outflow.note,
            withdrawalHash: Withdrawal.withdrawalHash(
              outflow.note,
              outflow.data,
            ),
          })
        }
      }
    }
    logger.debug(`utxo list.. ${utxoHashes}`)
    const myUtxoList = await this.db.read(prisma =>
      prisma.utxo.findMany({
        where: {
          hash: { in: utxoHashes.map(output => output.toString(10)) },
          treeId: null,
        },
      }),
    )
    const myWithdrawalList = await this.db.read(prisma =>
      prisma.withdrawal.findMany({
        where: {
          hash: { in: withdrawalHashes.map(h => h.noteHash.toString(10)) },
          treeId: null,
        },
      }),
    )
    const shouldTrack: { [key: string]: boolean } = {}
    for (const myNote of myUtxoList) {
      shouldTrack[myNote.hash] = true
      logger.debug(`found my note: ${myNote.hash}`)
    }
    for (const myNote of myWithdrawalList) {
      shouldTrack[myNote.hash] = true
    }
    for (const output of utxoHashes) {
      logger.debug(`utxo...: ${output.toString(10)}`)
      const trackThisNote = shouldTrack[output.toString(10)]
      utxos.push({
        hash: output,
        shouldTrack: !!trackThisNote,
      })
    }
    for (const hash of withdrawalHashes) {
      const keepTrack = shouldTrack[hash.noteHash.toString(10)]
      withdrawals.push({
        hash: hash.withdrawalHash.toBN(),
        noteHash: hash.noteHash,
        shouldTrack: !!keepTrack,
      })
    }
    for (const tx of block.body.txs) {
      for (const inflow of tx.inflow) {
        nullifiers.push(inflow.nullifier)
      }
    }
    return {
      header,
      utxos,
      withdrawals,
      nullifiers,
    }
  }
}
