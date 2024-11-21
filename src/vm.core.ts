import { Jsvm } from "./vm/ast_run"
import { db_vm_deploy, db_vm_find_contract, db_vm_update } from "./connet"
import { VMVAR } from "./constant"
import { getSpaceInfo } from "./space"
import { type_update_func_2, type_vm_deploy } from "./type"
import { BN } from "./vm/default_var"

export const vm_call: type_update_func_2 = async (space_id, f_name, params, gas, transaction, height) => {
    return new Promise(async (resolve) => {
        const res = await db_vm_find_contract(space_id) as any
        if(!res){
            resolve()
            return
        }
        if(res?.spaceid !== space_id){
            return console.error('vm_call not find SI::', space_id)
        }
        const contractCode = res.vm_text
        const { VMSpaceKeys, VMSpaceValue, contract} = getSpaceInfo(contractCode)
    
        const transactionKeys = [
            ...VMSpaceKeys, 
            'Transaction',
            'BN',
        ]
        const transactionInfo = [...VMSpaceValue, transaction, BN]
    
        let json: any = {}
        try {
            json = JSON.parse(res.space)
        } catch (error) {
            return console.log('error')
        }
    
        let i = -1
        for (const key of transactionKeys) {
            i++
            if(VMVAR.includes(key)){
                continue
            }
            const newVal = json[key]
            if(typeof newVal !== 'undefined'){
                transactionInfo[i] = newVal
            }
        }
    
        const vm_res = Jsvm({gas, contract, callName: f_name, params, transactionKeys, transactionInfo})
        
    
        // console.log('vm_res::', vm_res)
        // update
    
        if(!vm_res?.currentEnv){
            return console.log('vm_res err')
        }
        
        let marge = {} as any
        let min_marge: Object = {}
    
        // console.log('transactionKeys::', transactionKeys)
        let j = -1
        for (const key of transactionKeys) {       
            j++     
            if(VMVAR.includes(key)){
                continue
            }
            // TODO get err
            const newVal = (vm_res.currentEnv as any)[key]
    
            if(typeof newVal !== 'undefined'){
                marge[key] = newVal
                // @ts-ignore
                if(vm_res?.update_log?.[key]){
                    // @ts-ignore
                    min_marge[key] = vm_res.update_log[key]
                }
            }
        }
        const margeJson = {
            ...json,
            ...marge
        }
        const newSpaceJson = JSON.stringify(margeJson)
        
    
        console.log('newSpaceJson::', newSpaceJson)
        await db_vm_update(space_id, newSpaceJson, transaction, JSON.stringify(min_marge), height)
        resolve()
    })
}

export const vm_deploy: type_vm_deploy = async (space_id, hash,  type, contract, transactionKeys, transactionInfo, json) => {

    db_vm_deploy(space_id, hash, type, contract, transactionInfo[0] as unknown as number, json)
}