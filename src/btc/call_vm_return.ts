import { insc } from "./insc";
import * as dotenv from "dotenv";
dotenv.config();
const { WIF, BTC_NETWORK } = process.env;

const fee_value = 206;

// address
const is_send = false;
const is_decode = true;
const p = "S";

var spaceCall = `btc-vm-space-token-0 transfer [100]`
var recv = 'bc1pxxx'

console.log(spaceCall.length)

// debug
insc({
  spaceCode: spaceCall,
  WIF: WIF ?? "",
  is_send,
  is_decode,
  recv,
  network: BTC_NETWORK, 
  fee_value,
  p,
});

// main
// issue_rune({symbol, decimals, supply, WIF: WIF ?? '', fee_value})