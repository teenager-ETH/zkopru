/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import BN from 'bn.js'
import { Contract, ContractOptions } from 'web3-eth-contract'
import { EventLog } from 'web3-core'
import { EventEmitter } from 'events'
import { ContractEvent, Callback, TransactionObject, BlockType } from './types'

interface EventOptions {
  filter?: object
  fromBlock?: BlockType
  topics?: string[]
}

export class SMT254 extends Contract {
  constructor(jsonInterface: any[], address?: string, options?: ContractOptions)
  clone(): SMT254
  methods: {
    EXIST(): TransactionObject<string>

    NON_EXIST(): TransactionObject<string>
  }
  events: {
    allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter
  }
}
