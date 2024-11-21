import {
    initEccLib,
    networks,
    script as Script,
    Signer,
    payments,
    crypto,
    Psbt,
    Transaction,
    address,
    Block
  } from "bitcoinjs-lib";
import { broadcast, IUTXO, waitUntilUTXO } from "./blockstream_utils";
import { ECPairFactory, ECPairAPI, TinySecp256k1Interface } from "ecpair";
import { encode_issue } from "./encode";
const header = 'ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d38004c'
const header2 = 'ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d3800'
  
  import * as vint from 'varuint-bitcoin';
import { type_decoded_tx } from "../type";
import { decodeInscription } from "./decode_inscription";
//   import * as tinysecp from 'tiny-secp256k1'
  const tinysecp: TinySecp256k1Interface = require("tiny-secp256k1");
  initEccLib(tinysecp as any);
  const ECPair: ECPairAPI = ECPairFactory(tinysecp);
  const ecc = tinysecp
  
  export const insc = async ({
    spaceCode,
    WIF,
    recv,
    is_send = true,
    is_decode = false,
    fee_value,
    network = '',
    p = 'S',
    utxo,
  }: {
    spaceCode: string;
    WIF: string;
    is_send?: boolean;
    is_decode?: boolean;
    recv?: string;
    fee_value: number;
    p?: string;
    // network?: networks.Network
    network?: string,
    utxo?: IUTXO,
  }) => {
    const network1 = network === 'FBTEST' || network === 'MAINNET' ? networks.bitcoin : networks.testnet

    const keypair = ECPair.fromWIF(WIF, network1);
    const tweakedSigner = tweakSigner(keypair, { network: network1 });
    const p2pktr = payments.p2tr({
      pubkey: toXOnly(tweakedSigner.publicKey),
      network: network1,
    });
  
    const payerAddress = p2pktr.address;
    if (!payerAddress) {
      return console.log("payerAddress error");
    }

    // console.log('payerAddress::', payerAddress)
  
    const utxos = utxo ? [utxo] : await waitUntilUTXO(payerAddress, network === 'FBTEST' || network === 'MAINNET');
    // console.log(`Using UTXO ${utxos[0].txid}:${utxos[0].vout}`);
  
    const psbt = new Psbt({ network: network1 });
    psbt.addInput({
      hash: utxos[0].txid,
      index: utxos[0].vout,
      witnessUtxo: { value: utxos[0].value, script: p2pktr.output! },
      tapInternalKey: toXOnly(keypair.publicKey),
    });

    // console.log('p2pktr.output---::', p2pktr.output)
  
    const opReturnOutput = encode_issue(p, spaceCode);

    // console.log('opReturnOutput::', opReturnOutput)
    psbt.addOutput({
      script: opReturnOutput!,
      value: 0,
    });
    
    // let recv_value = 0
    // if(recv){
    //   psbt.addOutput({
    //     address: recv || p2pktr.address!,
    //     value: 330,
    //   });
    //   recv_value = 330
    // }


      // let i = 0
      // while(i < 49) {
      //   i++
      //   psbt.addOutput({
      //     address: recv || p2pktr.address!,
      //     value: 500,
      //   });
      //   recv_value += 500
      // }
    
    // psbt.addOutput({
    //   address: p2pktr.address!,
    //   value: utxos[0].value - recv_value - fee_value,
    // });

  
    psbt.signInput(0, tweakedSigner);
    psbt.finalizeAllInputs();
  
    const tx = psbt.extractTransaction();
    console.log(`${tx.toHex()}`);
    if (is_send) {
      const txid = await broadcast(tx.toHex(),  network === 'FBTEST' || network === 'MAINNET');
      console.log(`Success! Txid is ${txid}`);
    }
    if (is_decode) {
      decoderawtransaction(tx.toHex());
    }
  };
  
  export const decoderawtransaction = (stx: string | Transaction) => {
    const network = networks.bitcoin;

    if (network) {
      // const buffer = Buffer.from(raw_tx_hex, "hex");
      const tx = typeof stx === 'string' ? Transaction.fromBuffer(Buffer.from(stx, "hex"), network as any) : stx;
      const decodedTx: type_decoded_tx = {
        txid: tx.getId(),
        inputs: [],
        outputs: [],
      };
      
  
      // console.log('tx::', tx)
      for (const input of tx.ins) {
        let address = ''
        try {
          address = p2trScriptToAddress(input.witness)
        } catch (error) {
          // console.log('p2trScriptToAddress error::', error)
        }
        if(!address) {
          // console.log(input)
        }
        // console.log('address', address)
        const inputDetails = {
          prevTxId: input.hash.reverse().toString("hex"),
          outputIndex: input.index,
          scriptSig: input.script.toString("hex"),
          txinwitness: [] as any,
          address,
          inscriptionContent: '',
        };
  
        if (input.witness.length > 0) {
          for (const witnessItem of input.witness) {
            const h = witnessItem.toString("hex")
            
            inputDetails.txinwitness.push(h);
            if(
                h.substring(64 + 2, 64 + 2 + header.length) === header ||
                h.substring(64 + 2, 64 + 2 + header2.length) === header2
              ){
                inputDetails.inscriptionContent = decodeInscription(h)
                // console.log('inputDetails.inscriptionContent::', inputDetails.inscriptionContent)
            }
          }
        }
        // console.log(inputDetails)
        decodedTx.inputs.push(inputDetails);
      }
      for (const output of tx.outs) {
        let _address = ''
        try {
          _address = address.fromOutputScript(
            output.script,
            networks.bitcoin
          )
        } catch (error) {
          // console.log('fromOutputScript error::', error)
          output.script
        }
        const outputDetails = {
          value: output.value,
          scriptPubKey: output.script.toString("hex"),
          address: _address, 
          ASM: Script.toASM(output.script),
          returnSpace: ''
        };
        if(outputDetails.ASM.substring(0, 'OP_RETURN 53 '.length) === 'OP_RETURN 53 '){
          const spaceReturns = outputDetails.ASM.split('OP_RETURN 53 ')
          outputDetails.returnSpace = Buffer.from(spaceReturns[1], 'hex').toString()
        }
        // console.log('outputDetails', outputDetails)
        decodedTx.outputs.push(outputDetails);
      }
      // console.log(decodedTx.inputs);
      // console.log(decodedTx.outputs);
      return decodedTx
    }
  };
  
export  function tweakSigner(signer: Signer, opts: any = {}): Signer {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let privateKey: Uint8Array | undefined = signer.privateKey!;
    if (!privateKey) {
      throw new Error("Private key is required for tweaking signer!");
    }
    if (signer.publicKey[0] === 3) {
      privateKey = tinysecp.privateNegate(privateKey);
    }
  
    const tweakedPrivateKey = tinysecp.privateAdd(
      privateKey,
      tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash)
    );
    if (!tweakedPrivateKey) {
      throw new Error("Invalid tweaked private key!");
    }
  
    return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
      network: opts.network,
    });
  }
  
  function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer {
    return crypto.taggedHash(
      "TapTweak",
      Buffer.concat(h ? [pubKey, h] : [pubKey])
    );
  }
  
  function toXOnly(pubkey: Buffer): Buffer {
    return pubkey.subarray(1, 33);
  }

  function p2trScriptToAddress(witness: Buffer[]): string {
    if (!Array.isArray(witness) || !witness.every(b => Buffer.isBuffer(b))) {
      throw new Error('All witness elements must be Buffers');
    }
  
    const wlen = witness.length;
    if (wlen < 2) {
      throw new Error('Not a p2tr script spend witness');
    }
  
    let annexOffset = 0;
    if (witness[wlen - 1][0] === 0x50) {
      // has annex
      annexOffset = 1;
    }
  
    if (wlen < 2 + annexOffset) {
      throw new Error('Not a p2tr script spend witness');
    }
  
    const controlBlock = witness[wlen - annexOffset - 1];
    if (controlBlock.length < 33 || ((controlBlock.length - 33) / 32) % 1 !== 0) {
      throw new Error('Incorrect Control block length');
    }
  
    const script = witness[wlen - annexOffset - 2];
    const leafVersion = controlBlock[0] & 0xfe;
    const internalPubkey = controlBlock.subarray(1, 33);
  
    // Get preimage for tapleaf hash
    const preImageLeafHash = Buffer.allocUnsafe(
      script.length + vint.encodingLength(script.length) + 1,
    );
    preImageLeafHash.writeUInt8(leafVersion, 0);
    vint.encode(script.length, preImageLeafHash, 1);
    script.copy(preImageLeafHash, 1 + vint.encodingLength(script.length));
    // Get tapleaf hash
    let tapLeafHash = crypto.taggedHash('TapLeaf', preImageLeafHash);
  
    const loops = (controlBlock.length - 33) / 32;
    for (let j = 0; j < loops; j++) {
      const branch = controlBlock.subarray(33 + 32 * j, 65 + 32 * j);
  
      if (Buffer.compare(tapLeafHash, branch) < 0) {
        tapLeafHash = crypto.taggedHash(
          'TapBranch',
          Buffer.concat([tapLeafHash, branch]),
        );
      } else {
        tapLeafHash = crypto.taggedHash(
          'TapBranch',
          Buffer.concat([branch, tapLeafHash]),
        );
      }
    }
  
    const final = crypto.taggedHash(
      'TapTweak',
      Buffer.concat([internalPubkey, tapLeafHash]),
    );
    if (!ecc.isPrivate(final)) {
      throw new Error(
        'Rare error. Final taptree hash was higher than curve order',
      );
    }
    const result = ecc.xOnlyPointAddTweak(internalPubkey, final);
    if (result === null) {
      throw new Error('Error when tweaking');
    }
  
    return address.fromOutputScript(
      Buffer.concat([Buffer.from([0x51, 0x20]), Buffer.from(result.xOnlyPubkey)]),
    );
  }