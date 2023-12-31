import bigDecimal from 'js-big-decimal'
import * as crypto from '@helpers/crypto'
import {
  generateSignature,
  convertToJager,
  convertToBinance,
} from '@helpers/utils'
import {decodeAddress} from './address'
import {convertObjectToSignBytes, marshalBinary, AminoPrefix} from './amino'
import {
  IFeeItem,
  IFeeSync,
  IInput,
  IMsg,
  IOutput,
  IRawTxData,
  ITxData,
} from '@helpers/types'

const DEFAULT_CHAIN_ID = 'Binance-Chain-Tigris'
const DEFAULT_SOURCE = 1

/**
 * Class BinanceTx.
 * This class is responsible for calculating the fee list
 * and generating and signing a Binance transaction
 * @class
 */

export class BnbTx {
  protected chain_id: number | string
  protected address: string
  protected account_number: number
  protected source: boolean | number
  protected fee: IFeeSync[] | [] | number
  protected balance: number
  protected publicKey: string
  private memo: string
  private msg: any
  private signatures: any
  private feeList: any
  protected feeIds: any
  private rawTx: string
  /**
   * Create a BinanceTx
   * @param {Object} data - Input data for generating a transaction and calculating a fee
   * @param {number} data.chain_id
   * @param {string} data.address - Sender's address
   * @param {number} data.account_number
   * @param {number} data.sequence
   * @param {number} data.source
   * @param {Array} data.fee - Fee list
   * @param {Array} data.balance - Sender's balance
   * @param {string} data.privateKey
   * @param {string} data.publicKey
   */

  constructor(data: ITxData) {
    data = data || {}
    this.chain_id = data.chain_id || DEFAULT_CHAIN_ID
    this.address = data.address
    this.account_number = data.account_number || 0
    this.source = Number.isInteger(data.source) || DEFAULT_SOURCE
    this.fee = data.fee || []
    this.balance = convertToJager(data.balance)
    this.publicKey = data.publicKey
    this.memo = ''
    this.msg = []
    this.signatures = []
    this.feeList = []
    this.feeIds = {
      1: 'optimal',
    }
    this.rawTx = ''
  }

  /**
   * Calculating a fee list
   * @returns {Array} Returns a set of fees
   */

  calcFee(): IFeeItem[] {
    this.feeList = []

    // @ts-ignore
    for (const item of this.fee) {
      const fee = {
        id: this.feeIds[item.level],
        fee: convertToBinance(item.baseFee),
        coinValue: convertToBinance(item.baseFee),
        value: item.baseFee,
      }

      this.feeList.push(fee)
    }
    return this.feeList
  }

  /**
   * sign transaction with a given private key and msg
   * @param {Object} data - Input data for a transaction
   * @param {string} data.addressTo - Recipient address
   * @param {number} data.amount - The transaction amount
   * @param {number} data.fee - The transaction fee
   * @param {string} data.memo - The transaction memo
   * @return {Transaction}
   **/

  make(data: IRawTxData): object {
    const {privateKey, sequence} = data
    this.memo = data.memo || ''
    this.msg = this.getSignMsg(data)
    const signBytes = this.getSignBytes(this.msg, sequence)
    const privKeyBuf: any = Buffer.from(privateKey, 'hex')
    const signature = generateSignature(signBytes.toString('hex'), privKeyBuf)
    this.addSignature(this.publicKey, signature, sequence)
    const rawTx = this.serialize()
    const hash = this.getHash()
    return {tx: rawTx, hash}
  }

  /**
   * Getting signed transaction message
   * @returns {Object}
   */

  getSignMsg(data: IRawTxData): object {
    const {address, amount, fee} = data
    const feeInJager = convertToJager(fee)
    const amountInJager = convertToJager(amount)
    const fullAmount = bigDecimal.add(feeInJager, amountInJager)
    const change = +bigDecimal.subtract(this.balance, fullAmount)

    if (change < 0) {
      throw new Error('Insufficient balance')
    }

    const inputs = [
      {
        coins: [
          {
            denom: 'BNB',
            amount: +amountInJager,
          },
        ],
        address: this.address,
      },
    ]

    const outputs = [
      {
        address: address,
        coins: [
          {
            denom: 'BNB',
            amount: +amountInJager,
          },
        ],
      },
    ]

    return {
      inputs,
      outputs,
    }
  }

  /**
   * Getting the transaction message
   * @returns {Object}
   */

  getMsg(msg: any): IMsg {
    msg.inputs = msg.inputs.map((item: IInput) => {
      return {
        address: decodeAddress(item.address),
        coins: item.coins,
      }
    })
    msg.outputs = msg.outputs.map((item: IOutput) => {
      return {
        address: decodeAddress(item.address),
        coins: item.coins,
      }
    })

    msg.aminoPrefix = AminoPrefix.msg
    return msg
  }

  /**
   * Generate the sign bytes for a transaction, given a msg
   * @param {Object} msg - msg object
   * @return {Buffer}
   */

  getSignBytes(msg: any, sequence: number): Buffer {
    const signMsg = {
      account_number: this.account_number.toString(),
      chain_id: this.chain_id,
      data: null,
      memo: this.memo,
      msgs: [msg],
      sequence: sequence.toString(),
      source: this.source.toString(),
    }
    return convertObjectToSignBytes(signMsg)
  }

  /**
   * Attaches a signature to the transaction
   * @param {string} pubKey
   * @param {Buffer} signature
   */

  addSignature(pubKey: string, signature: Buffer, sequence: number) {
    const pubKeyBuf = this._serializePubKey(Buffer.from(this.publicKey, 'hex')) // => Buffer
    this.signatures = [
      {
        pub_key: pubKeyBuf,
        signature: signature,
        account_number: this.account_number,
        sequence: sequence,
      },
    ]

    return this
  }

  /**
   * Encode signed transaction to hex which is compatible with amino
   * @returns {string}
   */

  serialize(): string {
    if (!this.signatures) {
      throw new Error('need signature')
    }
    const msg = this.getMsg(this.msg)

    const stdTx = {
      msg: [msg],
      signatures: this.signatures,
      memo: this.memo,
      source: this.source,
      data: '',
      aminoPrefix: AminoPrefix.tx,
    }

    const bytes = marshalBinary(stdTx)
    // @ts-ignore
    this.rawTx = bytes.toString('hex')
    return this.rawTx
  }

  /**
   * Getting the transaction hash
   * @returns {string}
   */

  getHash(): string {
    if (this.rawTx) {
      return crypto.sha256(this.rawTx).toUpperCase()
    }

    return ''
  }

  /**
   * Serializes a public key in a 33-byte compressed format.
   * @param {Buffer} unencodedPubKey
   * @return {Buffer}
   */

  _serializePubKey(unencodedPubKey: Buffer): Buffer {
    let pubBz = crypto.encodeBinaryByteArray(unencodedPubKey)
    pubBz = Buffer.concat([
      Buffer.from(AminoPrefix.PubKeySecp256k1, 'hex'),
      pubBz,
    ])

    return pubBz
  }
}
