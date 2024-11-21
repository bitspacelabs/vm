import { Jsvm } from "../vm/ast_run";
import { decoderawtransaction } from "../btc/insc";
import { FREE_GAS } from "../constant";
import { getSpaceCallInfo, getSpaceCallInfov2, getSpaceInfo } from "../space";
import { vm_call, vm_deploy } from "../vm.core";
import { Transaction } from "bitcoinjs-lib";

type type_spaceids = {
    deploy: Array<string>;
    call: Array<string>;
}

export async function tx_raw_to_vm(raw: string | Transaction, block_height: number, get_raw: (tx: string) => Promise<string>): Promise<type_spaceids>{
    return new Promise(async (resolve) => {
        let spaceids: type_spaceids = {
            deploy: [],
            call: [],
        }
        if(raw){
            const tx = decoderawtransaction(raw);
            // console.log('tx::', tx)
            let index = 0
            if(tx?.inputs) for (const input of tx.inputs) {
            // tx?.inputs.forEach((input, index) => {
                if(input.inscriptionContent){
                    const inputs = tx.inputs
                    const outputs = tx.outputs
                    const transaction = {
                        txid: tx.txid,
                        height: block_height,
                        inputs, outputs, index
                    }
                    // console.log(transaction, input.inscriptionContent)
                    // console.log(input.inscriptionContent)
                                    
                    // const space_id = tx.txid + 'i' + index
                    const spaceCode =input.inscriptionContent
                    
                    const { VMSpaceKeys: transactionKeys, VMSpaceValue: transactionInfo, contract, json, isSpace} = getSpaceInfo(spaceCode)
                    const space_id = json?.spaceid
                    if(isSpace && space_id){
                        // console.log('space_id::', space_id, transaction)
                        spaceids.deploy.push(space_id)
                        await vm_deploy(space_id, transaction.txid, json?.type || 'null', spaceCode, [
                            ...transactionKeys, 
                            'Transaction',
                        ], [...transactionInfo, transaction], JSON.stringify(json))
                    }
                }
                index++;
            }
            let index2 = 0
            if(tx?.outputs) for (const out of tx.outputs) {
                if(out.returnSpace){
                    const callInfo = getSpaceCallInfov2(out.returnSpace)
                    if(callInfo){
    
                        const prevTxId = tx.inputs[0].prevTxId
                        const prevOutIndex = tx.inputs[0].outputIndex
                        const raw = await get_raw(prevTxId)
                        // console.log('raw::', raw)
                        const prevTx = decoderawtransaction(raw);
                        const prevAddress = prevTx?.outputs[prevOutIndex].address
                        
                        if(prevAddress) {
                            tx.inputs[0].address = prevAddress
                        }
    
                        const gas = FREE_GAS
                        const index = index2
                        const transaction = {
                            txid: tx.txid,
                            height: block_height,
                            inputs: tx.inputs, outputs: tx.outputs, index
                        }
                        // space special virtual utxo
                        // Reject dust attacks
                        if(!transaction.outputs[1]){
                            transaction.outputs.push({
                                value: 0,
                                scriptPubKey: '',
                                address: transaction.inputs[0].address,
                                ASM: '',
                                returnSpace: '',
                            })
                        }
                        // console.log('vm_call::', callInfo.spaceid, callInfo.fun, callInfo.params, gas, transaction)
                        spaceids.call.push(callInfo.spaceid)
                        await vm_call(callInfo.spaceid, callInfo.fun, callInfo.params, gas, transaction, block_height)
                    }
                }
                index2++
            }
        }
        resolve(spaceids)
    })
}



