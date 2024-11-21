import { DEFAULT_START_BLOCK, LAST_BLOCK } from "../constant";

const fs = require('fs');

// const dir = LAST_BLOCK;
// fs.mkdir(dir, { recursive: true }, (err: any) => {
//   if (err) throw err;
// });

export const dbGetBlockLast = async () => {
    return new Promise<string>((ok, reject) => {
        fs.readFile(LAST_BLOCK, 'utf-8', (err: any, data: any) => {
            if (err) {
                if(err.errno === -4058){
                    dbSetBlockLast(DEFAULT_START_BLOCK + '').then(() => {
                        ok(DEFAULT_START_BLOCK + '')
                    })
                    return
                }
                return reject(err)
            }
            const last = data;
            ok(last)
        });
    })
}
export const dbSetBlockLast = async (data: string) => {
    return new Promise<void>((ok, reject) => {
        fs.writeFile(LAST_BLOCK, data, (err: any) => {
            if (err) {
                return reject(err)
            }
            ok()
        })
    })
}