import bigDecimal from 'js-big-decimal'
// @ts-ignore
import ecc from 'tiny-secp256k1'
import {sha256} from './crypto'
import {HDNode} from '@noonewallet/core-js'
import {getBnbAddressByPublicKey} from '@BNB/address'

const PRECISION = 8

export const convertToJager = (amount: number): number => {
  if (!amount || isNaN(+amount)) return 0
  const jager: string = bigDecimal.multiply(amount, Math.pow(10, 8))
  return +bigDecimal.floor(jager)
}

export const convertToBinance = (amount: number): number => {
  if (!amount || isNaN(+amount)) return 0
  return +bigDecimal.divide(amount, Math.pow(10, 8), PRECISION)
}

export const generateSignature = (
  signBytesHex: any,
  privateKey: string,
): any => {
  const msgHash = sha256(signBytesHex)
  const msgHashHex = Buffer.from(msgHash, 'hex')
  return ecc.sign(msgHashHex, Buffer.from(privateKey, 'hex'))
}

export const getBnbCore = (node: HDNode) => {
  const BNB_PATH = `m/44'/714'/0'/0/0`
  const bnbNode = node.derive(BNB_PATH)
  const privateKey = bnbNode.privateKey.toString('hex')
  const publicKey = bnbNode.publicKey.toString('hex')
  const externalAddress = getBnbAddressByPublicKey(publicKey)

  return {
    privateKey,
    publicKey,
    externalAddress,
  }
}
