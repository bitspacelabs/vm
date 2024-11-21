import dotenv from 'dotenv'
import axios from "axios";

dotenv.config()

axios.defaults.baseURL = process.env.BTC_MAINNET_RPC_0

const {BTC_MAINNET_USER, BTC_MAINNET_PASSWORD} = process.env

const auth  = BTC_MAINNET_USER ? {
  username: BTC_MAINNET_USER,
  password: BTC_MAINNET_PASSWORD,
} : void 0
export const btc_rpc_node_info = async () => {
  return await axios.post(
    '',
    '{"jsonrpc": "1.0", "id": "curltest", "method": "getblockchaininfo", "params": []}',
    {
      headers: {
        'content-type': 'text/plain;'
      },
      auth,
    }
  );
}
export const btc_rpc_block_hash = async (blocknumber: number) => {
  return await axios.post(
    '/',
    JSON.stringify({ "jsonrpc": "1.0", "id": "curltest", "method": "getblockhash", "params": [blocknumber] }),
    {
      headers: {
        'content-type': 'text/plain;'
      },
      auth,
    }
  );
}

export const btc_rpc_block = async (blockhash: string) => {
  return await axios.post(
    '/',
    JSON.stringify({ "jsonrpc": "1.0", "id": "curltest", "method": "getblock", "params": [blockhash] }),
    {
      headers: {
        'content-type': 'text/plain;'
      },
      auth,
    }
  );
}
export const btc_rpc_block0 = async (blockhash: string) => {
  return await axios.post(
    '/',
    JSON.stringify({ "jsonrpc": "1.0", "id": "curltest", "method": "getblock", "params": [blockhash, 0] }),
    {
      headers: {
        'content-type': 'text/plain;'
      },
      auth,
    }
  );
}

export const btc_rpc_raw_transaction = async (txid: string, block_hash?: string) => {
  return await axios.post(
    '/',
    JSON.stringify({ "jsonrpc": "1.0", "id": "curltest", "method": "getrawtransaction", "params":  [txid, false, block_hash] }),
    {
      headers: {
        'content-type': 'text/plain;'
      },
      auth,
    }
  );
}