export interface IFeeSync {
  level: number
  baseFee: number
}

export interface IFeeItem {
  id: number
  fee: number
  coinValue: number
  value: number
}

export interface IMsg {
  inputs: IInput[] | IInput
  outputs: IOutput[] | IOutput
  aminoPrefix?: string
}

export interface ITxData {
  chain_id: number
  hash: string
  blockHeight: number
  blockTime: number
  type: string
  fee: IFeeSync[] | [] | number
  code: number
  source: number
  sequence: number
  memo: string
  log: string
  data: string
  asset: string
  amount: number
  fromAddr: string
  toAddr: string
  address: Address
  account_number: number
  balance: any
  publicKey: string
}

export interface IRawTxData {
  privateKey: string
  sequence: number
  memo: string
  address: Address
  amount: number
  fee: any
}

export type Address = string
export type KeyInWif = string
export type RawTx = string

export interface IInput {
  hash?: string
  index?: number
  address: Address
  value?: number
  key?: KeyInWif
  tx?: RawTx | null
  transaction_hash?: string
  coins: any
}

export interface IOutput {
  address: Address
  value: number
  coins: any
}
