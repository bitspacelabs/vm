export type type_transaction = {
  txid: string;
  height: number;
  index: number;
  inputs:  {
    prevTxId: string;
    outputIndex: number;
    scriptSig: string;
    txinwitness: any;
    address: string;
    inscriptionContent: string;
  }[];
  outputs: {
    value: number;
    scriptPubKey: string;
    address: string;
    ASM: string;
    returnSpace: string;
  }[];
}
export type type_update_func_1 = (contract: string, contract_id: string, f_name: string, transactionKeys: string[]) => void;
export type type_update_func_2 = (contract_id: string, f_name: string, params: Array<string | number>, gas: number, transaction: type_transaction, height: number) => Promise<void>;
export type type_vm_deploy = (space_id: string, hash: string, type: string, contract: string, transactionKeys: string[], transactionInfo: string[], json: string) => void;

export type type_decoded_tx = {
    txid: string,
    inputs: {
      prevTxId: string;
      outputIndex: number;
      scriptSig: string;
      txinwitness: any;
      address: string;
      inscriptionContent: string;
    }[],
    outputs: {
      value: number;
      scriptPubKey: string;
      address: string;
      ASM: string;
      returnSpace: string;
    }[]
  }