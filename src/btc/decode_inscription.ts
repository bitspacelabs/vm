import { script } from "bitcoinjs-lib"

export const decodeInscription = (witness: string) => {
    // const inner = Buffer.from(h.substring(64 + 2 + header.length + 2, h.length - 1), 'hex').toString()
    // return inner
    try {
        const asm = script.toASM(Buffer.from(witness, 'hex')).split('OP_0 OP_IF 6f7264')
        let start = 0
        const asm2 = asm[1]?.split(' ') || []
    
        let content: Array<string> = []
        for (const element of asm2) {
            if (element === 'OP_0') {
                start++
                continue
            }
            if (element === 'OP_ENDIF') {
                break
            }
            if (start > 0) {
                content.push(element)
            }
        }
        return Buffer.from(content.join(''), 'hex').toString()
    } catch (error) {
        return ''
    }
}