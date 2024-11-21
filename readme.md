.env

```
BTC_NETWORK=MAINNET
BTC_MAINNET_RPC_0=http://127.0.0.1:8332
BTC_MAINNET_USER=root
BTC_MAINNET_PASSWORD=123456
```

ts-node : 10.9.0

run
```
ts-node ./src/btc_main.ts --env--file=.env
```


# BTC Space VM Contract Develop

## SPACE Language


```ts

type Transaction = {
  txid: string;
  height: number;
  index: number;
  inputs:  {
    prevTxId: string;
    outputIndex: number;
    scriptSig: string;
    txinwitness: Array<string>;
    address: string;
    inscriptionContent: string;
  }[];
  outputs: {
    value: number;
    scriptPubKey: string;
    address: string;
    ASM: string;
    returnSpace: string;
  }[];
}


type BN =  {
    decimal: (n: number) => boolean;
    plus: (a: n, b: n) => string;
    minus: (a: n, b: n) => string;
    div: (a: n, b: n) => string;
    dividedBy: (a: n, b: n) => string;
    times: (a: n, b: n) => string;
    sqrt: (a: n) => string;
    mod: (a: n, b: n) => string;
    modulo: (a: n, b: n) => string;
    comparedTo: (a: n, b: n) => string;
}
```


#### Deploy

```ts
SPACE VM DEPLOY::{"v": 0.1, "spaceid": "btc-vm-space-token-0", "type": "btc20", "key1": "space", "key2": 0,  "key3": {}}

function pub_mint(){
    // your code
}
function pub_transfer(num){
    // your code
}
```


#### CALL SPACE

<SpaceId> <function name> <Array JSON>

```
btc-vm-space-tokenid transfer [1.8]
```

Example

raw::
020000000001019c31b8068d4814aa430d2498635d45a6068b498a0d6ea8a1dd84efcd3e9ed88c0100000000ffffffff030000000000000000276a0153236274632d766d2d73706163652d746f6b656e2d30207472616e73666572205b3130305d4a01000000000000225120401eb6f5822e6588e4bcf6e337f7d8771ca2d205437b4ffc6968d26ae3e3416d9cfe3c0000000000225120401eb6f5822e6588e4bcf6e337f7d8771ca2d205437b4ffc6968d26ae3e3416d0140869a5f6ff2825b721b2c1380d1c873eb4c7c62a89fb292bb305182508a084749740781251af70d4d184f6115087cf2ae7d76050e77e273d5c9a7d23434e45b5300000000



## Test

### FB TEST

#### Rpcs test

https://mempool-testnet.fractalbitcoin.io/api/address/<youraddress>/utxo


