import { SPACE_START_CALL, SPACE_START_INIT } from "./constant"

export const getSpaceInfo = (spaceCode: string) => {
        
    let VMSpaceKeys: string[] = []
    let VMSpaceValue: any[] = []
    // TODO check 
    let spaceJson: any = {}
    let contract = spaceCode
    let isSpace = false
    for (const line of spaceCode.split("\n")) {
        if(line.startsWith(SPACE_START_INIT)){
            try {
                const json = JSON.parse(line.split(SPACE_START_INIT)[1])
                spaceJson = json
                VMSpaceKeys = Object.keys(json)
                for (const key of VMSpaceKeys) {
                    VMSpaceValue.push(json[key])
                }
                contract = spaceCode.split(line)[1]
                isSpace = true
            } catch (error) {
            }
            break
        }
    }

    return {
        VMSpaceKeys,
        VMSpaceValue,
        contract,
        json: spaceJson,
        isSpace
    }
}

export const getSpaceCallInfo = (spaceCode: string) => {
    for (const line of spaceCode.split("\n")) {
        if(line.startsWith(SPACE_START_CALL)){
            try {
                const json = JSON.parse(line.split(SPACE_START_CALL)[1]) as {
                    v: Number;
                    spaceid: string;
                    fun: string;
                    params: Array<string | number>
                }
                if(typeof json.spaceid === 'string' && typeof json.fun === 'string' && json.params instanceof Array){
                    return json
                }
            } catch (error) {
                console.log('call info parse error::', error)
            }
            break
        }
    }
    return false
}

//  'btc-vm-space-tokenid transfer [1.8]'
export const getSpaceCallInfov2 = (spaceCall: string) => {
    const spaceid = spaceCall.split(" ")[0]
    const fun = spaceCall.split(" ")[1]
    if(spaceid && fun){
        try {
            let params: Array<number | string>
            if(spaceCall.length <= (spaceid + fun).length + 1){
                params = []
            }else{
                const params_str = spaceCall.substring((spaceid + fun).length + 2, spaceCall.length)
                params = JSON.parse(params_str)
            }
            const json = {
                spaceid,
                fun, 
                params
            }

            if(typeof json.spaceid === 'string' && typeof json.fun === 'string' && json.params instanceof Array){
                return json
            }
        } catch (error) {
            console.log('call info parse error::', error)
        }
    }

    return false
}