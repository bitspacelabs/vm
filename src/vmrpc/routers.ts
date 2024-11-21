import { getCallSpacePsbt } from "../btc/psbt";
import { db, db_vm_find_space } from "../connet";

export const handleRouters = (router: any) => {
  router.get("/api/call_psbt", async (ctx: any, next: any) => {
    const txid = ctx.query.txid;
    const vout = parseInt(ctx.query.vout);
    const value = parseInt(ctx.query.value);
    const payerAddress = ctx.query.payerAddress;
    const spaceCall = ctx.query.spaceCall;
    const recv = ctx.query.recv;
    const fee_value = parseInt(ctx.query.fee_value);

    // console.log(txid)
    const res = getCallSpacePsbt({
      payerAddress,
      utxo: {
        txid,
        vout,
        value,
      },
      recv,
      spaceCall,
      fee_value
    })
    ctx.body = JSON.stringify({
      data: res,
    });
  });
  router.get("/api/space_info", async (ctx: any, next: any) => {
    const spaceid = ctx.query.spaceid;
    const res = await new Promise((ok) => {
      db_vm_find_space(spaceid).then((res) => {
        ok(res)
      })
    });
    ctx.body = JSON.stringify({
      data: res,
    });
  });
  router.get("/api/vm_logs", async (ctx: any, next: any) => {
    const spaceid = ctx.query.spaceid;
    const page = parseInt(ctx.query.page) || 1;
    const limit = parseInt(ctx.query.limit) || 10;
    const offset = (page - 1) * limit;

    
    if(spaceid){
      const total = await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as total FROM vm_logs WHERE spaceid = ?', [spaceid], (err, row: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.total);
          }
        });
      });
    
  
      const res = await new Promise((ok) => {
        db.all('SELECT * FROM vm_logs WHERE spaceid = ?  LIMIT ? OFFSET ?', [spaceid,  limit, offset], (err: any, rows: any) => {
          if(err){
              return console.log(err)
          }
          ok(rows)
        })
      })
  
      ctx.body = JSON.stringify({
        total,
        data: res,
      });
    }else{
      
      const res = await new Promise((ok) => {
        db.all('SELECT * FROM vm_logs  LIMIT ? OFFSET ?', [limit, offset], (err: any, rows: any) => {
          if(err){
              return console.log(err)
          }
          ok(rows)
        })
      })
  
      ctx.body = JSON.stringify({
        data: res,
      });
    }
  });
}