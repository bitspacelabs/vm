
// var h = '209e2849b90a2353691fccedd467215c88eec89a5d0dcf468e6cf37abed344d746ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d38004c5e7b200a20202270223a20226272632d3230222c0a2020226f70223a20226465706c6f79222c0a2020227469636b223a20226f726469222c0a2020226d6178223a20223231303030303030222c0a2020226c696d223a202231303030220a7d68'
var h = '2091fc3cff3e40a8bbb303054b9a5bf7942a8593cdc17be9baa322189359369d62ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d38004cbc73706163653a3a7b2276223a20302e312c20226d696e745f737570706c79223a20347d0a0a66756e6374696f6e2061646428612c2062297b0a2020202072657475726e2061202b20620a7d0a66756e6374696f6e207075625f6d696e7428612c2062297b0a202020206d696e745f737570706c79203d20616464286d696e745f737570706c792c2061202a2062290a7d0a66756e6374696f6e207075625f726573657428297b0a202020206d696e745f737570706c79203d20340a7d68'

const header = 'ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d38004c'

if(
    h.substring(64 + 2, 64 + 2 + header.length)
    ==
    header
){
    const inner = Buffer.from(h.substring(64 + 2 + header.length + 2, h.length - 1), 'hex').toString()
    
    console.log('..'+inner+'..')
}


// let next = true
// let start = 0
// let end = 2
// while(next){
//     let nextLenHex = h.substring(start, start + 2)
    
//     if(!nextLenHex){
//         next = false
//         break
//     }

//     console.log(nextLenHex)
//     let nextLen = parseInt(nextLenHex, 16) * 2

//     console.log(nextLen)

//     let inner =  h.substring(start + 2, start + 2 + nextLen)
//     console.log(
//        inner
//     )
//     console.log(
//         'inner::',
//         Buffer.from(inner, 'hex').toString()
//     )
    
//     start += 2 + nextLen
// }



// let marker = Buffer.from('ord', 'utf-8').toString('hex')

// console.log(marker)

// const mimetype = Buffer.from('text/plain;charset=utf-8').toString('hex')

// let asm =  ['OP_CHECKSIG', 'OP_0', 'OP_IF', marker, '01', mimetype, 'OP_0' ].join(' ')
// console.log(asm)
// console.log(
//     script.fromASM(asm)
//   )