// @ts-ignore
import {CoinsNetwork} from '@noonewallet/network-js'
import {getCurrentTimestamp} from '@helpers/timestamp'
import {IFeeSync, ITxData} from '@helpers/types'

const requests = CoinsNetwork.bnb

export class BnbSync {
  private balance: number
  private symbol: string
  protected address: string
  private sequence: number
  private account_number: number
  private fee: IFeeSync[]
  private transactions: ITxData[]

  /**
   * Create a BinanceSync
   * @param {string} address - address ??
   */
  constructor(address: string) {
    this.address = address
    this.balance = 0
    this.symbol = ''
    this.sequence = 0
    this.account_number = 0
    this.transactions = []
    this.fee = []
  }

  async Start(): Promise<void> {
    await Promise.all([
      await this.getInfo(),
      await this.getTransactions(),
      await this.getFee(),
    ])
  }

  async getInfo(): Promise<void> {
    this.balance = 0

    const res = await requests.getInfo(this.address)

    if (res.hasOwnProperty('balances')) {
      this.balance = res.balances.length ? +res.balances[0].free || 0 : 0
      this.symbol = res.balances.length ? res.balances[0].symbol || '' : ''
      this.account_number = res.account_number || 0
      this.sequence = res.sequence || 0
    }
  }

  async getTransactions(): Promise<void> {
    this.transactions = []
    const endTime: number = getCurrentTimestamp()
    const startTime: number = endTime - 60 * 60 * 24 * 7
    const step = 50

    const req = async () => {
      const addParams = {
        address: this.address,
        startTime,
        endTime,
        offset: 0,
        limit: step,
      }

      const res = await requests.getTxInfo(addParams)

      if (res && res?.txs) {
        this.transactions = [...res.txs, ...this.transactions]
        if (res.txs.length < res.total) {
          addParams.offset += step
          await req()
        }
      }
    }

    await req()
  }

  async getFee(): Promise<void> {
    try {
      this.fee = await requests.getFees()
    } catch (err) {
      console.log('BNB getFeesRequest', err)
    }
  }

  get DATA() {
    return {
      address: this.address,
      balance: this.balance,
      symbol: this.symbol,
      sequence: this.sequence,
      account_number: this.account_number,
      transactions: this.transactions,
      fee: this.fee,
    }
  }
}
