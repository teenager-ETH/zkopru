export const RollUpChallengeABI = [
  {
    inputs: [],
    name: 'CHALLENGE_PERIOD',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAX_UTXO_PER_TREE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAX_WITHDRAWAL_PER_TREE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MINIMUM_STAKE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'NULLIFIER_TREE_DEPTH',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'REF_DEPTH',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'UTXO_SUB_TREE_DEPTH',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'UTXO_SUB_TREE_SIZE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'UTXO_TREE_DEPTH',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'WITHDRAWAL_SUB_TREE_DEPTH',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'WITHDRAWAL_SUB_TREE_SIZE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'WITHDRAWAL_TREE_DEPTH',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'allowedMigrants',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'massDepositHash', type: 'bytes32' },
    ],
    name: 'committedDeposits',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'utxoRoot', type: 'bytes32' }],
    name: 'finalizedUTXOs',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'genesis',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'numOfInputs', type: 'uint8' },
      { internalType: 'uint8', name: 'numOfOutputs', type: 'uint8' },
    ],
    name: 'getVk',
    outputs: [
      { internalType: 'uint256[2]', name: 'alfa1', type: 'uint256[2]' },
      { internalType: 'uint256[2][2]', name: 'beta2', type: 'uint256[2][2]' },
      { internalType: 'uint256[2][2]', name: 'gamma2', type: 'uint256[2][2]' },
      { internalType: 'uint256[2][2]', name: 'delta2', type: 'uint256[2][2]' },
      { internalType: 'uint256[2][]', name: 'ic', type: 'uint256[2][]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latest',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'massDepositId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'migrationHash', type: 'bytes32' },
    ],
    name: 'migrations',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'header', type: 'bytes32' }],
    name: 'parentOf',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'proposalId', type: 'bytes32' }],
    name: 'proposals',
    outputs: [
      { internalType: 'bytes32', name: 'header', type: 'bytes32' },
      { internalType: 'uint256', name: 'challengeDue', type: 'uint256' },
      { internalType: 'bool', name: 'slashed', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proposedBlocks',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
    name: 'proposers',
    outputs: [
      { internalType: 'uint256', name: 'stake', type: 'uint256' },
      { internalType: 'uint256', name: 'reward', type: 'uint256' },
      { internalType: 'uint256', name: 'exitAllowance', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'snapshotTimestamp',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'stagedDeposits',
    outputs: [
      { internalType: 'bytes32', name: 'merged', type: 'bytes32' },
      { internalType: 'uint256', name: 'fee', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'stagedSize',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'header', type: 'bytes32' }],
    name: 'utxoRootOf',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'idx', type: 'uint256' }],
    name: 'withdrawables',
    outputs: [
      { internalType: 'bytes32', name: 'root', type: 'bytes32' },
      { internalType: 'uint256', name: 'index', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'leaf', type: 'bytes32' }],
    name: 'withdrawn',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'utxoRollUpId', type: 'uint256' },
      { internalType: 'uint256[]', name: '_deposits', type: 'uint256[]' },
      { internalType: 'uint256', name: 'numOfUTXOs', type: 'uint256' },
      { internalType: 'bytes', name: '', type: 'bytes' },
      { internalType: 'bytes', name: 'blockData', type: 'bytes' },
    ],
    name: 'challengeUTXORollUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'nullifierRollUpId', type: 'uint256' },
      { internalType: 'uint256', name: 'numOfNullifiers', type: 'uint256' },
      { internalType: 'bytes', name: '', type: 'bytes' },
      { internalType: 'bytes', name: 'blockData', type: 'bytes' },
    ],
    name: 'challengeNullifierRollUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'withdrawalRollUpId', type: 'uint256' },
      { internalType: 'uint256', name: 'numOfWithdrawals', type: 'uint256' },
      { internalType: 'bytes', name: '', type: 'bytes' },
      { internalType: 'bytes', name: 'blockData', type: 'bytes' },
    ],
    name: 'challengeWithdrawalRollUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]
