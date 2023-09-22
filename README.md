[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://github.com/noonewallet/binance-core-ts/blob/main/LICENSE)
[![Platform](https://img.shields.io/badge/platform-web-blue.svg?style=flat)]()
![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fnoonewallet%2Fbinance-core-ts%2Fmain%2Fpackage.json&query=version&label=version)

![binance-core-ts](https://github.com/noonewallet/noone-android-core-crypto/assets/111989613/1f062349-24d4-4824-9c00-b8f2724eca51)

# binance-core-ts
The binance-core-ts library is an implementation of tools for working with Binance.The library allows generating BNB addresses and keys, as well as signing transactions.

**Note**: Node version >= 16.15.0
## Usage

### Generate addresses:
```
import {utils as BnbUtils}                from '@noonewallet/binance-core-ts'
import {createCoreByMnemonic, hdFromXprv} from '@noonewallet/core-js'

const mnemonic = 'judge same gain ... salad lake cash'
const {xprv} = createCoreByMnemonic(mnemonic)
const node = hdFromXprv(xprv)
const core = BnbUtils.getBnbCore(node)
console.log(
  core.privateKey,
  core.publicKey,
  core.externalAddress
)
```

### Create transaction:
```
import {BnbTx} from '@noonewallet/binance-core-ts'

txHandler = new BnbTx({
  address: 'bnb18lv5tn4q...8x6cxanehc0q', // a sender address
  account_number: 4065011, // a sender account number
  publicKey: '032ccc39e75eb254e393fd5...a63ce29ca5c0a5c6193029e2241a', // a sender public key
  balance: 15.18, // a sender balance
  fee: 0.000075 // a default fee
})

let tx_params = {
  address: 'bnb18mtwnkyd9...vspmp2f2ak',
  amount: 0.001225,
  fee: 0.000075,
  privateKey: 'c86bbc168088be5fe1d...df0c86f03f09ab' 
  memo: 'hello'
}

const sign_tx = txHandler.make(tx_params)
console.log(
  sign_tx.hash, // => '1B44382269870329...BADA4D82FA32CD4B9',
  sign_tx.tx, // => 'a210a143fdcc0ad4e6d60...1084bd0712210acea0aa7d'
)
```

## Created using
* [@noonewallet/crypto-core-ts](https://github.com/noonewallet/crypto-core-ts)
* [bech32](https://github.com/bitcoinjs/bech32)
* [bn.js](https://github.com/indutny/bn.js/)
* [ecpair](https://github.com/bitcoinjs/ecpair)
* [elliptic](https://github.com/indutny/elliptic)


## License

binance-core-ts is available under the MIT license. See the [LICENSE](https://github.com/noonewallet/binance-core-ts/blob/main/LICENSE) file for more info.
