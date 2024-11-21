import { Block, Transaction } from "bitcoinjs-lib"
import { bak_vm_contract, db_vm_find_space, db_vm_fork_update, del_bak_vm_contract, del_vm_logs, get_bak_vm_contract_with_height, get_vm_block_hash, set_vm_block_hash } from "../connet"
import { tx_raw_to_vm } from "./main"
import { BAK_HEIGHT_NUM } from "../constant";
import { reverseBuffer } from "../lodash/reverse";

type MockBlockData = {
    prevHash: {
        toString: () => string;
    };
    getHash(): {
        toString: () => string;
    };
    transactions: Array<Transaction | string>;
}

type blockData = Block | MockBlockData

export const handleTxs = async ({
    get_raw,
    block_height,
    blockData,
    nextBlock,
    curHash,
    prevHash,
}: {
    get_raw: (txid: string) => Promise<string>;
    block_height: number;
    blockData: blockData;
    nextBlock(block_height: number): Promise<void>;
    curHash: string;
    prevHash: string;
}) => {
    let txs:Array<Transaction | string> = []
    try {
        const vmPrevHash = await get_vm_block_hash(block_height - 1 + '')
        const vmCurrentHash = await get_vm_block_hash(block_height + '')

        if(vmCurrentHash === curHash){
            console.log('--vmCurrentHash--')
            return false
        }
        // block fork
        if(vmPrevHash && vmPrevHash !== prevHash){
            console.log('vmPrevHash::', block_height, vmPrevHash, prevHash)
            // not need update vm block hash
            await del_vm_logs(block_height)
            const contractInfos = await get_bak_vm_contract_with_height(block_height - 1)
            // reset
            for (const contractInfo of contractInfos) {
                await db_vm_fork_update(contractInfo.spaceid, contractInfo.space_json)
            }
            await nextBlock(block_height - 2)
            return false
        }
        
        await set_vm_block_hash(block_height + '', curHash)

        txs = blockData?.transactions
    } catch (error) {
        await new Promise(ok => setTimeout(ok, 9000))
        return false
    }

    let calls: Array<string> = []
    if(txs instanceof Array){
        for (const tx of txs) {
            const raw = tx
            if(!raw){
                continue
            }
            try {
                const spaceids = await tx_raw_to_vm(raw, block_height, get_raw)
                const t6 = new Date().getTime()
                calls.push(...spaceids.call)
            } catch (error) {
                console.log('error tx_raw_to_vm catch', error)
                continue
            }
        }
    }else{
        console.log('error:: array', block_height)
    }
    
    for (const call_spaceid of Array.from(new Set(calls))) {
        const res = await db_vm_find_space(call_spaceid)
        await bak_vm_contract(call_spaceid, res.space, block_height)    
    }
    
    await del_bak_vm_contract(block_height - BAK_HEIGHT_NUM)
    

    return true
}