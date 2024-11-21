import BigNumber from "bignumber.js"

const DECIMAL_PLACES = 8
BigNumber.set({ DECIMAL_PLACES })

type n = string | number;

export const BN = {
    decimal: (n: number) => {
        var s = (n * 1e8) + ''
        return parseInt(s) + '' === s
    },
    plus: (a: n, b: n) => {
        return new BigNumber(a).plus(b).toString()
    },
    minus: (a: n, b: n) => {
        return new BigNumber(a).minus(b).toString()
    },
    div: (a: n, b: n) => {
        return new BigNumber(a).div(b).toString()
    },
    dividedBy: (a: n, b: n) => {
        return new BigNumber(a).dividedBy(b).toString()
    },
    times: (a: n, b: n) => {
        return new BigNumber(a).times(b).toString()
    },
    sqrt: (a: n) => {
        return new BigNumber(a).sqrt().toString()
    },
    mod: (a: n, b: n) => {
        return new BigNumber(a).mod(b).toString()
    },
    modulo: (a: n, b: n) => {
        return new BigNumber(a).modulo(b).toString()
    },
    comparedTo: (a: n, b: n) => {
        return new BigNumber(a).comparedTo(b).toString()
    },
}