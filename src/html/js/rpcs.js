window.baseURL = 'http://54.206.113.217:8080'
// window.baseURL = 'http://127.0.0.1:3333'
// window.baseURL = 'http://192.168.110.157:3333'
const api2 = baseURL + `/api/vm_logs?spaceid=`
window.baseMempool = 'https://mempool.space'
const getMempoolAddressUrl = (address) => {
    return baseMempool + '/address/' + address
}
const getMempoolTxUrl = (txid) => {
    return baseMempool + '/tx/' + txid
}

const shortAddress = (address) => {
    if(address && typeof address === 'string' && address.length > 15) {
        if(window?.outerWidth && window.outerWidth >= 1500) {
            return address
        }
        if(window?.outerWidth && window.outerWidth > 1500) {
            return address.substring(0, 16) + '...' + address.substring(address.length - 16, address.length)
        }
        return address.substring(0, 8) + '...' + address.substring(address.length - 8, address.length)
    }
}

window.shortAddress = shortAddress

const shortHash = (address) => {
    if(window?.outerWidth && window.outerWidth > 1500) {
        return address
    }
    if(address && typeof address === 'string' && address.length > 60) {
        return address.substring(0, 10) + '...' + address.substring(address.length - 10, address.length)
    }
}
window.shortHash = shortHash

const shortHash2 = (address) => {
    if(address && typeof address === 'string' && address.length > 60) {
        return address.substring(0, 10) + '...' + address.substring(address.length - 10, address.length)
    }
}
window.shortHash2 = shortHash2

let page = 1
window.next_logs = (spaceId) => {
    page ++
    rpc_logs(spaceId)
}
window.rpc_logs = (spaceId) => {
    axios.get(api2 + (spaceId || ''), {
        params: {
            page,
        }
    }).then(res => {
        console.log(res.data)
        const data = res.data.data
        if(data){
            for (const item of data) {
                const transaction = JSON.parse(item.t_json)
                // console.log(transaction)
                var node = document.createElement('li')
                var SpaceIDNode = document.createElement('div')
                var AddressBlockNode = document.createElement('div')
                var address1 = document.createElement('div')
                var address2 = document.createElement('div')
                for (const input of transaction.inputs) {
                    const blockLine = document.createElement('div')
                    blockLine.className = 'inputs'
                    const blockLineA = document.createElement('a')
                    blockLineA.innerText = shortAddress(input.address)
                    // blockLineA.setAttribute('')
                    blockLineA.href = getMempoolAddressUrl((input.address))
                    blockLineA.setAttribute('target', '_blank')
                    blockLine.appendChild(blockLineA)
                    address1.appendChild(blockLine)
                } 
                address1.className = 'inputs'
                for (const output of transaction.outputs) {
                    const blockLine = document.createElement('div')
                    blockLine.setAttribute('style', 'display: flex')
                    const blockLineA = document.createElement( shortAddress(output.address) ? 'a' : 'span')
                    const blockLineValue = document.createElement('space')
                    blockLineA.innerText = shortAddress(output.address) || (output.ASM ? 'RETURN OP' : '--')
                    blockLineValue.innerText = Number(output.value) / 1e8
                    // blockLineA.setAttribute('')
                    blockLineA.href = getMempoolAddressUrl((output.address))
                    blockLineA.setAttribute('target', '_blank')
                    blockLine.appendChild(blockLineA)
                    blockLine.appendChild(blockLineValue)
                    address2.appendChild(blockLine)
                } 
                address2.className = 'outputs'
                var ANode = document.createElement('a')
                AddressBlockNode.appendChild(address1)
                AddressBlockNode.appendChild(address2)
                AddressBlockNode.className = 'addresses'
                const AddressTitleNode = document.createElement('div')
                const AddressTitleLeftNode = document.createElement('div')
                const AddressTitleRightNode = document.createElement('div')
                const AddressTitleRightButtonNode = document.createElement('button')
                AddressTitleNode.setAttribute('style', 'display: flex; justify-content: space-between; margin-top: 10px; font-size: 24px')
                AddressTitleLeftNode.innerText = 'Inputs&outputs'
                AddressTitleRightButtonNode.innerText = 'More Info'
                AddressTitleRightNode.appendChild(AddressTitleRightButtonNode)
                AddressTitleNode.appendChild(AddressTitleLeftNode)
                AddressTitleNode.appendChild(AddressTitleRightNode)

                var LogNode = document.createElement('pre')
                LogNode.innerText = item?.update_log

                node.appendChild(SpaceIDNode)
                node.appendChild(ANode)
                node.appendChild(AddressTitleNode)
                node.appendChild(AddressBlockNode)
                node.appendChild(LogNode)

                SpaceIDNode.innerText = item.spaceid

                ANode.href = getMempoolTxUrl(transaction.txid)
                ANode.innerText = shortHash(transaction.txid)
                ANode.setAttribute('target', '_blank')

                logs_ul.appendChild(node)
            }
        }
    })
}