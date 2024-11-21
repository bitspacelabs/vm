import { Block, Transaction } from "bitcoinjs-lib"
import { DEFAULT_START_BLOCK } from "../constant"
import { dbGetBlockLast, dbSetBlockLast } from "./io"
import { handleTxs } from "./handle_txs"

import { reverseBuffer } from "../lodash/reverse"
import { AxiosResponse } from "axios"

const initBlockHeight = DEFAULT_START_BLOCK

export const run: (p: {
    btc_rpc_block0: (blockhash: string) => Promise<AxiosResponse<any, any>>;
    btc_rpc_block_hash: (blocknumber: number) => Promise<AxiosResponse<any, any>>;
    btc_rpc_node_info: () => Promise<AxiosResponse<any, any>>;
    btc_rpc_raw_transaction: (txid: string, block_hash?: string) => Promise<AxiosResponse<any, any>>
}) => Promise<void> = async ({btc_rpc_block0, btc_rpc_block_hash, btc_rpc_node_info, btc_rpc_raw_transaction}) => {
    while(true){
        let startblock = Number(await dbGetBlockLast())
        if(!startblock) {
            console.log('start init')
            startblock = initBlockHeight
        }
        const res = await btc_rpc_node_info()
        if(res.data.result){
            let block_hash = ''
            const block_height = startblock + 1
            
            console.log(res.data.result.blocks, block_height)
            if(block_height > res.data.result.blocks){
                await new Promise(ok => setTimeout(ok, 9000))
                continue
            }
            
            
            try {
                const block_hash_res = await btc_rpc_block_hash(block_height)
                block_hash = block_hash_res.data.result
            } catch (error) {
                console.log('retry block hash...')
            }
            if(!block_hash){
                await new Promise(ok => setTimeout(ok, 1000))
                continue
            }

            
            const get_raw = async (txid: string) => {
                const raw_res = await btc_rpc_raw_transaction(txid)
                const raw = raw_res.data.result
                return raw
            }

            try {
                // const t1 = new Date().getTime()
                const blocks0 = await btc_rpc_block0(block_hash)
                // const t2 = new Date().getTime()
                // console.log('1::', (t2 - t1) / 1000)
                if(!blocks0.data){
                    return
                }
                
                const blockData = Block.fromHex(blocks0.data.result)
                
                const prevHash = reverseBuffer(blockData.prevHash as Buffer).toString('hex')
                
                const t3 = new Date().getTime()
                if(!await handleTxs({
                    get_raw,
                    block_height,
                    blockData,
                    curHash: block_hash,
                    prevHash,
                    nextBlock: async (block_height: number) => await dbSetBlockLast(block_height + ''),
                })){
                    continue
                }
                
                const t4 = new Date().getTime()
                console.log('2:', (t4 - t3) / 1000)

            } catch (error) {
                console.log('error: btc_rpc_block0::', error)
                continue
            }
            console.log('block_height::', block_height)
            await dbSetBlockLast(block_height + '')
        }
    }
}