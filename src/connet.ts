import * as sqlite3 from "sqlite3"
import { type_transaction } from "./type"

export const db = new sqlite3.Database(
    'vm.db', 
    // 'vm.test.db', 
    function (err) {
        if (err) {
            return console.log(err.message)
        }
        console.log('connect database successfully')
    }
)

db.run('CREATE TABLE IF NOT EXISTS contract(spaceid text PRIMARY KEY NOT NULL, hash text NOT NULL, type text NOT NULL, vm_text text NOT NULL, v INT NOT NULL, space text NOT NULL)', function (err) {
    if (err) {
        return console.log(err)

    }
})
db.run(`CREATE TABLE IF NOT EXISTS vm_logs (
    spaceid TEXT NOT NULL,
    height INTEGER NOT NULL,
    t_json TEXT PRIMARY Key NOT NULL,
    update_log TEXT NOT NULL
);    
`, function (err) {
    if (err) {
        return console.log(err)
    }
})

export const db_vm_deploy  = async (spaceid: string, hash: string, type: string, vm_text: string, v: number, spaceJson: string) => {
    return new Promise((ok) => {
        db.run('INSERT INTO contract(spaceid, hash, type, vm_text, v, space) VALUES(?, ?, ?, ?, ?, ?)', [spaceid, hash, type, vm_text, v, spaceJson], function (err) {
            if (err) {
                ok(0)
                return console.log('insert data error: ', err.message)
            }
            ok(1)
        })
    })
}


export const del_vm_logs  = async (height: number) => {
    db.run('DELETE FROM vm_logs WHERE height = ?', [height], function (err) {
        if (err) {
            return console.log('del_vm_logs', err.message)
        }
    })
}

// TODO async err
export const db_vm_update  = async (spaceid: string, spaceJson: string, transaction: type_transaction, logs: string, height: number) => {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO vm_logs (spaceid, t_json, update_log, height) VALUES (?,?,?,?)`,
            [spaceid, 
            JSON.stringify(transaction), 
            logs,
            height], 
            (err: any, rows: any) => {
                if(!err){
                    db.run('UPDATE contract SET space = ? WHERE spaceid = ?', [spaceJson, spaceid], function (err) {
                        if (err) {
                            return console.log('update data error: ', spaceid, err.message)
                        }
                    })
                    resolve(1)
                }else{
                    console.log('err::', err)
                    resolve(0)
                }
            }
        )
    })
}

export const db_vm_fork_update  = async (spaceid: string, spaceJson: string) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE contract SET space = ? WHERE spaceid = ?', [spaceJson, spaceid], function (err) {
            if (err) {
                return console.log('update data error: ', spaceid, err.message)
            }
        })
        resolve(1)
    })
}

export const db_vm_find_contract = async (spaceid: string) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT spaceid, hash, vm_text, space FROM contract WHERE spaceid = ?', [spaceid], (err: any, rows: any) => {
            if(err){
                resolve(0)
                return console.log(err)
            }
            resolve(rows)
        })
    })
}

export const db_vm_find_space = async (spaceid: string): Promise<{
    spaceid: string;
    space: string;
    vm_text: string;
    hash: string;
    type: string;
}> => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM contract WHERE spaceid = ?', [spaceid], (err: any, rows: any) => {
            if(err){
                return console.log(err)
            }
            resolve(rows)
        })
    })
}


db.run('CREATE TABLE IF NOT EXISTS vm_block_hash(height text PRIMARY KEY NOT NULL, hash text NOT NULL)', function (err) {
    if (err) {
        return console.log(err)
    }
})
export const get_vm_block_hash  = async (height: string) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM vm_block_hash WHERE height = ?', [height], function (err, row: { height: string; hash: string }) {
            if (err) {
                reject(row)
                // resolve('')
                return console.log('get_vm_block_hash error: ', err.message)
            }
            resolve(row?.hash)
        })
    })
}
export const set_vm_block_hash  = async (height: string, hash: string) => {
    db.run('INSERT INTO vm_block_hash(height, hash) VALUES(?, ?)', [height, hash], function (err) {
        if (err) {
            return console.log('insert vm_block_hash error: ', err.message)
        }
    })
}


db.run(`CREATE TABLE IF NOT EXISTS contract_bak (
    spaceid TEXT NOT NULL,
    space_json TEXT NOT NULL,
    height INTEGER NOT NULL
);    
`, function (err) {
    if (err) {
        return console.log(err)
    }
})
export const bak_vm_contract  = async (spaceid: string, spaceJson: string, height: number) => {
    db.run('INSERT INTO contract_bak(spaceid, space_json, height) VALUES(?, ?, ?)', [spaceid, spaceJson, height], function (err) {
        if (err) {
            return console.log('insert data error: ', err.message)
        }
    })
}
export const del_bak_vm_contract  = async (height: number) => {
    db.run('DELETE FROM contract_bak WHERE height < ?', [height], function (err) {
        if (err) {
            return console.log('del_bak_vm_contract', err.message)
        }
    })
}
export const get_bak_vm_contract_with_height  = async (height: number): Promise<{
    spaceid: string
    height: string
    space_json: string
}[]> => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM contract_bak WHERE height = ?', [height], function (err, row: {
            spaceid: string
            height: string
            space_json: string
        }[]) {
            if (err) {
                reject(err)
                return console.log('get_bak_vm_contract_with_height error: ', err.message)
            }
            resolve(row)
        })
    })
}
export const get_bak_vm_contract_with_space  = async (spaceid: string): Promise<{
    spaceid: string
    height: string
    space_json: string
}[]> => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM contract_bak WHERE spaceid = ?', [spaceid], function (err, row: {
            spaceid: string
            height: string
            space_json: string
        }[]) {
            if (err) {
                reject(err)
                return console.log('get_bak_vm_contract_with_space error: ', err.message)
            }
            resolve(row)
        })
    })
}


export const contractBb = db
