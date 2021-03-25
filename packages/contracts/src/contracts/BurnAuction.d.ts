/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import BN from 'bn.js'
import { ContractOptions } from 'web3-eth-contract'
import { EventLog } from 'web3-core'
import { EventEmitter } from 'events'
import {
  Callback,
  PayableTransactionObject,
  NonPayableTransactionObject,
  BlockType,
  ContractEventLog,
  BaseContract,
} from './types'

interface EventOptions {
  filter?: object
  fromBlock?: BlockType
  topics?: string[]
}

export type NewHighBid = ContractEventLog<{
  roundIndex: string
  bidder: string
  amount: string
  0: string
  1: string
  2: string
}>
export type UrlUpdate = ContractEventLog<{
  coordinator: string
  0: string
}>

export interface BurnAuction extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions,
  ): BurnAuction
  clone(): BurnAuction
  methods: {
    auctionEnd(): NonPayableTransactionObject<string>

    auctionStart(): NonPayableTransactionObject<string>

    balance(): NonPayableTransactionObject<string>

    coordinatorUrls(arg0: string): NonPayableTransactionObject<string>

    highestBidPerRound(
      arg0: number | string | BN,
    ): NonPayableTransactionObject<{
      owner: string
      amount: string
      0: string
      1: string
    }>

    lastBalanceIndex(): NonPayableTransactionObject<string>

    lockedRoundIndex(): NonPayableTransactionObject<string>

    minBid(): NonPayableTransactionObject<string>

    pendingBalances(arg0: string): NonPayableTransactionObject<string>

    roundLength(): NonPayableTransactionObject<string>

    startBlock(): NonPayableTransactionObject<string>

    zkopru(): NonPayableTransactionObject<string>

    /**
     * Shortcut for msg.sender to bid on an auction using msg.value amount.
     * @param roundIndex The round to bid on.*
     */
    'bid(uint256)'(
      roundIndex: number | string | BN,
    ): PayableTransactionObject<void>

    /**
     * Bid on an auction.
     * @param amount The amount of wei to bid on the round.*
     * @param roundIndex The auction round to bid on.
     */
    'bid(uint256,uint256)'(
      roundIndex: number | string | BN,
      amount: number | string | BN,
    ): NonPayableTransactionObject<void>

    /**
     * Bid on many rounds at once.
     * @param _minBid The minimum bid amount per round.
     * @param endRound The first round to bid on.*
     * @param maxBid The maximum bid amount per round.
     * @param startRound The round to start bidding.
     */
    multiBid(
      _minBid: number | string | BN,
      maxBid: number | string | BN,
      startRound: number | string | BN,
      endRound: number | string | BN,
    ): PayableTransactionObject<void>

    /**
     * Return the highest bid for a given round.
     * @param roundIndex The round to query.*
     */
    highestBidForRound(
      roundIndex: number | string | BN,
    ): NonPayableTransactionObject<{
      0: string
      1: string
    }>

    /**
     * Set the public url for a coordinator node.
     * @param url The IP or DNS based url with port, without protocol. ex: 127.0.0.1:8888*
     */
    setUrl(url: string): NonPayableTransactionObject<void>

    /**
     * Remove a url for a coordinator.*
     */
    clearUrl(): NonPayableTransactionObject<void>

    /**
     * Return the closest round that can be bid on.*
     */
    earliestBiddableRound(): NonPayableTransactionObject<string>

    /**
     * Return the furthest round that can be bid on.*
     */
    latestBiddableRound(): NonPayableTransactionObject<string>

    /**
     * The minimum bid for a given round.*
     */
    minNextBid(
      roundIndex: number | string | BN,
    ): NonPayableTransactionObject<string>

    /**
     * Return the address of the current high bidder for a given round. Returns 0x0 for rounds without an owner.
     * @param roundIndex The round index to query.*
     */
    coordinatorForRound(
      roundIndex: number | string | BN,
    ): NonPayableTransactionObject<string>

    /**
     * Return the current round owner.*
     */
    activeCoordinator(): NonPayableTransactionObject<string>

    /**
     * Return the start block of a given round.
     * @param roundIndex The round index to query.*
     */
    calcRoundStart(
      roundIndex: number | string | BN,
    ): NonPayableTransactionObject<string>

    /**
     * Return the round index that a given block belongs to.
     * @param blockNumber The block to to query.*
     */
    roundForBlock(
      blockNumber: number | string | BN,
    ): NonPayableTransactionObject<string>

    /**
     * Return the current round number.*
     */
    currentRound(): NonPayableTransactionObject<string>

    /**
     * Refund shortcut for msg.sender.*
     */
    'refund()'(): NonPayableTransactionObject<void>

    /**
     * Refund outstanding balances from non-winning bids. This is called the pending balance above.
     * @param owner The address to refund.*
     */
    'refund(address)'(owner: string): NonPayableTransactionObject<void>

    /**
     * Send the available contract balance to a recipient.
     * @param recipient The receiving address for the funds.*
     */
    transferBalance(recipient: string): NonPayableTransactionObject<void>

    /**
     * Update the contract available balance based on the current round.*
     */
    'updateBalance()'(): NonPayableTransactionObject<void>

    /**
     * Update the contract available balance based on winning bids.
     * @param maxIterations The maximum number of rounds to consider (to prevent out of gas issues).*
     */
    'updateBalance(uint256)'(
      maxIterations: number | string | BN,
    ): NonPayableTransactionObject<void>

    /**
     * Register as a coordinator.*
     */
    register(): PayableTransactionObject<void>

    /**
     * Open a round for anyone to propose blocks if needed.*
     */
    openRoundIfNeeded(): NonPayableTransactionObject<void>

    /**
     * Determine if a certain round should be opened to anyone. This happens if there is no bidder, or if no blocks are proposed in the first half of the round.*
     */
    shouldOpenRound(): NonPayableTransactionObject<boolean>

    isRoundOpen(): NonPayableTransactionObject<boolean>

    /**
     * This function will be updated as the governance of Zkopru's been updated.
     */
    isProposable(proposer: string): NonPayableTransactionObject<boolean>

    /**
     * Lock the contract to prevent future bids.*
     */
    lockForUpgrade(
      roundIndex: number | string | BN,
    ): NonPayableTransactionObject<void>
  }
  events: {
    NewHighBid(cb?: Callback<NewHighBid>): EventEmitter
    NewHighBid(options?: EventOptions, cb?: Callback<NewHighBid>): EventEmitter

    UrlUpdate(cb?: Callback<UrlUpdate>): EventEmitter
    UrlUpdate(options?: EventOptions, cb?: Callback<UrlUpdate>): EventEmitter

    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
  }

  once(event: 'NewHighBid', cb: Callback<NewHighBid>): void
  once(
    event: 'NewHighBid',
    options: EventOptions,
    cb: Callback<NewHighBid>,
  ): void

  once(event: 'UrlUpdate', cb: Callback<UrlUpdate>): void
  once(event: 'UrlUpdate', options: EventOptions, cb: Callback<UrlUpdate>): void
}
