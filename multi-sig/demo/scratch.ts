import { Buff }            from '@cmdcode/buff'
import { sha256, hash160 } from '@cmdcode/crypto-tools/hash'
import { get_pubkey }      from '@cmdcode/crypto-tools/keys'
import { Transaction }     from '@scure/btc-signer'

import { Address, Script, Tap } from '@cmdcode/tapscript'

const XPRV = 'tprv8ZgxMBicQKsPdZ3m3LQBZ9vDzdDuDaUiWhMueS28A5mEpye2Bbox1QaCbvShSrvgGP3gXJ7P719uWwjy8jeeNTvqmZZpKSZ3H4LkNwksUvt'

const seckey_a = sha256(Buff.str('alice')).hex
const pubkey_a = get_pubkey(seckey_a).hex

const seckey_b = sha256(Buff.str('bob')).hex
const pubkey_b = get_pubkey(seckey_b).hex

const seckey_c = sha256(Buff.str('carol')).hex
const pubkey_c = get_pubkey(seckey_c).hex

// const hd = HDKey.fromExtendedKey(XPRV, { ver})

// console.log('xprv:', hd.privateExtendedKey)

console.log(hash160(pubkey_a).hex)

const script_a = [ 'OP_2', pubkey_a, pubkey_b, pubkey_c, 'OP_3', 'OP_CHECKMULTISIG' ]
const script_b = [ pubkey_a, 'OP_CHECKSIGVERIFY', pubkey_b, 'OP_CHECKSIG' ]
const script_c = [ 'OP_0', pubkey_a, 'OP_CHECKSIGADD', pubkey_b, 'OP_CHECKSIGADD', 'OP_2', 'OP_NUMEQUAL' ]
const script_d = [ 'OP_DUP', 'OP_HASH160', hash160(pubkey_a).hex, 'OP_EQUALVERIFY', 'OP_CHECKSIG' ]

console.log(script_a)

const psbt_b64 = Buff.hex('70736274ff0100550200000001279a2323a5dfb51fc45f220fa58b0fc13e1e3342792a85d7e36cd6333b5cbc390000000000ffffffff01a05aea0b000000001976a914ffe9c0061097cc3b636f2cb0460fa4fc427d2b4588ac0000000000010120955eea0b0000000017a9146345200f68d189e1adc0df1c4d16ea8f14c0dbeb87220203b1341ccba7683b6af4f1238cd6e97e7167d569fac47f1e48d47541844355bd4646304302200424b58effaaa694e1559ea5c93bbfd4a89064224055cdf070b6771469442d07021f5c8eb0fea6516d60b8acb33ad64ede60e8785bfb3aa94b99bdf86151db9a9a010104220020771fd18ad459666dd49f3d564e3dbc42f4c84774e360ada16816a8ed488d5681010547522103b1341ccba7683b6af4f1238cd6e97e7167d569fac47f1e48d47541844355bd462103de55d1e1dac805e3f8a58c1fbf9b94c02f3dbaafe127fefca4995f26f82083bd52ae220603b1341ccba7683b6af4f1238cd6e97e7167d569fac47f1e48d47541844355bd4610b4a6ba67000000800000008004000080220603de55d1e1dac805e3f8a58c1fbf9b94c02f3dbaafe127fefca4995f26f82083bd10b4a6ba670000008000000080050000800000').to_base64()

console.log(psbt_b64)
// const pdata = Transaction.fromPSBT()

// console.log(pdata)
