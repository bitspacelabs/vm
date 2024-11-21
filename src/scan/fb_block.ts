import { DEFAULT_START_BLOCK } from "../constant"
import { fb_rpc_block, fb_rpc_info, fb_rpc_rawtx, get_fb_raw } from "./fp_rpcs"
import { dbGetBlockLast, dbSetBlockLast } from "./io"
import { tx_raw_to_vm } from "./main"

const initBlockHeight = DEFAULT_START_BLOCK

export const fb_run = async () => {
    while(true){
        let startblock = Number(await dbGetBlockLast())
        // let startblock = 206229
        // let startblock = 206243 - 1
        if(!startblock) {
            console.log('start init')
            startblock = initBlockHeight
        }
        const res = await fb_rpc_info()
        // console.log(res.data)
        if(res.data.code === 0){
            const block_height = startblock + 1
            const blocks = await fb_rpc_block(block_height)
            // console.log(blocks.data)
            
            console.log(res.data.data.blocks, block_height)
            if(block_height > res.data.data.blocks){
                await new Promise(ok => setTimeout(ok, 9000))
                continue
            }

            if(blocks.data.data instanceof Array){
                for (const tx of blocks.data.data) {
                    if(tx.size < 250){
                        continue
                    }
                    const txid = tx.txid
                    // console.log('txid::', tx)
                    const raw = await get_fb_raw(txid)
                    if(!raw){
                        continue
                    }
                    try {
                        await tx_raw_to_vm(raw, block_height, get_fb_raw)
                    } catch (error) {
                        console.log('error tx_raw_to_vm catch', error)
                        continue
                    }
                }
            }else{
                console.log('error:: array', block_height, blocks.data.data.length)
            }
            await dbSetBlockLast(block_height + '')
        }
    }
}