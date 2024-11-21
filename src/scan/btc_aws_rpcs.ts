import axios from "axios";

const SHA256 = require('@aws-crypto/sha256-js').Sha256
const defaultProvider = require('@aws-sdk/credential-provider-node').defaultProvider
const HttpRequest = require('@aws-sdk/protocol-http').HttpRequest
const SignatureV4 = require('@aws-sdk/signature-v4').SignatureV4

const signer = new SignatureV4({
  credentials: defaultProvider(),
  service: 'managedblockchain',
  region: 'us-east-1',
  sha256: SHA256,
});


const rpcRequest = async (rpc: Object) => {
  
  let bitcoinURL = 'https://mainnet.bitcoin.managedblockchain.us-east-1.amazonaws.com/';
  
  const url = new URL(bitcoinURL);
  
  const req = new HttpRequest({
    hostname: url.hostname.toString(),
    path: url.pathname.toString(),
    body: JSON.stringify(rpc),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
      host: url.hostname,
    }
  });

  
  const signedRequest = await signer.sign(req, { signingDate: new Date() });
  
  try {
    const response = await axios({...signedRequest, url: bitcoinURL, data: req.body})

    return response
    // console.log(response.data)
  } catch (error) {
    console.error('Something went wrong: ', error)
    throw error
  } 

}


export const btc_rpc_node_info = async () => {
    return await rpcRequest({"jsonrpc": "1.0", "id": "1001", "method": "getblockchaininfo", "params": []});
}
export const btc_rpc_block_hash = async (blocknumber: number) => {
  return await rpcRequest({ "jsonrpc": "1.0", "id": "1001", "method": "getblockhash", "params": [blocknumber] })
}

export const btc_rpc_block0 = async (blockhash: string) => {
  return await rpcRequest({ "jsonrpc": "1.0", "id": "1001", "method": "getblock", "params": [blockhash, 0] })
}
export const btc_rpc_block = async (blockhash: string) => {
  return await rpcRequest({ "jsonrpc": "1.0", "id": "1001", "method": "getblock", "params": [blockhash] })
}
export const btc_rpc_block2 = async (blockhash: string) => {
  return await rpcRequest({ "jsonrpc": "1.0", "id": "1001", "method": "getblock", "params": [blockhash, 2] })
}

export const btc_rpc_raw_transaction = async (txid: string, block_hash?: string) => {
  return await rpcRequest({ "jsonrpc": "1.0", "id": "1001", "method": "getrawtransaction", "params":  [txid, false, block_hash] })
}