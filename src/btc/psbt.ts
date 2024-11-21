import {
    address,
    initEccLib,
    networks,
    payments,
    Psbt,
  } from "bitcoinjs-lib";
import { TinySecp256k1Interface } from "ecpair";

const tinysecp: TinySecp256k1Interface = require("tiny-secp256k1");
initEccLib(tinysecp as any);

export const getCallSpacePsbt: (params: {
    payerAddress: string;
    utxo: {
        txid: string;
        vout: number;
        value: number;
    };
    spaceCall: string;
    recv?: string;
    fee_value: number;
}) => string = ({
    payerAddress,
    utxo,
    spaceCall,
    recv,
    fee_value
}) => {
    const psbt= new Psbt({ network: networks.bitcoin });
    psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: { value: utxo.value, script: address.toOutputScript(payerAddress) },
        // tapInternalKey: toXOnly(keypair.publicKey),
    });
    psbt.addOutput({
        script: payments.embed({
            data: [
                Buffer.from('S', "utf-8"),
                Buffer.from(spaceCall),
            ],
            }).output,
        value: 0,
    });
    let recv_value = 0
    if(recv){
      psbt.addOutput({
        address: recv,
        value: 330,
      });
      recv_value = 330
    }
    psbt.addOutput({
        address: payerAddress,
        value: utxo.value - recv_value - fee_value,
    });
    return psbt.toHex()
}