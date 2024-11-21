import { btc_rpc_block0, btc_rpc_block_hash, btc_rpc_node_info, btc_rpc_raw_transaction } from "./btc_aws_rpcs"
import { run } from "./run"

export const btc_aws_run = async () => {
    run({
        btc_rpc_block0, btc_rpc_block_hash, btc_rpc_node_info, btc_rpc_raw_transaction
    })
}