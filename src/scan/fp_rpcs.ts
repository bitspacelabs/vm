import dotenv from 'dotenv'
import axios from "axios";

dotenv.config()

const { BTC_TESTNET_RPC_KEY } = process.env;
axios.defaults.baseURL = 'https://open-api-fractal-testnet.unisat.io/'
const Authorization = 'Bearer ' + BTC_TESTNET_RPC_KEY

export const fb_rpc_info = async () => {
    return await axios.get('v1/indexer/blockchain/info', {
    params: {},
    headers: {
      'accept': 'application/json',
      'Authorization':  Authorization
    }
  });
}
export const fb_rpc_block = async (height: number) => {
    return await axios.get('v1/indexer/block/' + height + '/txs', {
        // TODO
    params: {
      'cursor': '0',
      'size': '9000'
    },
    headers: {
      'accept': 'application/json',
      'Authorization': Authorization
    }
  });
}
export const fb_rpc_rawtx = async (tx: string) => {
    return await axios.get('v1/indexer/rawtx/' + tx, {
    params: {},
    headers: {
      'accept': 'application/json',
      'Authorization': Authorization
    }
  });
}


export async function get_fb_raw(txid: string) {
  const raw_res = await fb_rpc_rawtx(txid)
  if(raw_res.data?.code === 0){
      const raw = raw_res.data.data
      return raw
  }
}