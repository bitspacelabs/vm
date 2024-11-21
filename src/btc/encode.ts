import { payments } from "bitcoinjs-lib";
import { number } from "bitcoinjs-lib/src/script";

const BASE_OFFSET = 1;
function symbolToInt(symbol: string): number {
  if (!symbol.match(/^[A-Z]+$/)) {
    throw new Error(
      `Invalid symbol: ${symbol}. Only uppercase letters A-Z are allowed`
    );
  }

  let value = 0;
  for (let i = 0; i < symbol.length; i++) {
    const c = symbol[symbol.length - 1 - i];
    value +=
      (c.charCodeAt(0) - "A".charCodeAt(0) + BASE_OFFSET) * Math.pow(26, i);
  }
  return value;
}
function name(varint_name: string) {
  const add = (a: string, b: string) => a + b;
  let base26_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  let name = base26_chars
    .map((e) => {
      return base26_chars[parseInt(e)];
    })
    .reduce(add);
  return name;
}

export enum ENCODE_TYPE {
  OW,
  HEX,
}
export function encode_issue(
    p: string,
    bitvm: string,
  encode_type = ENCODE_TYPE.HEX
) {
  const opReturnOutput = payments.embed({
    data: [
      Buffer.from(p, "utf-8"),
      Buffer.from(bitvm),
    ],
  }).output;
  return opReturnOutput;
}