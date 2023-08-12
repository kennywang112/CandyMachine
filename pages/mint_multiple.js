import styles from '../styles/Home.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey,Keypair } from "@solana/web3.js";
import { nftStorage } from "@metaplex-foundation/js-plugin-nft-storage";//npm install @metaplex-foundation/js-plugin-nft-storage
import { useMetaplex } from "./useMetaplex";
import { mintFromCandyMachineBuilder } from '@metaplex-foundation/js';//多張nft
import airdrop_list from '/whitelist.js';
import bs58 from "bs58";

export const Multiple= ({ onClusterChange }) => {
  const wallet = useWallet();
  const { signAllTransaction, signTransaction } = useWallet();
  const { metaplex } = useMetaplex();
  metaplex.use(nftStorage());

  const checkEligibility = async () => {
    const myWalletSecretKey = bs58.decode('Bhao6w2hvn5LtBgJ6nAno3qTy6WMyn59k7sdbFdJVsRapumSJfF86hZ1wcWJ6SxuEhuJUwC2DoNu5YTA9DyMFSy'); //私鑰轉回錢包keypair，帳戶名creator-cndmhV3
    const Authority = Keypair.fromSecretKey(myWalletSecretKey);
    //console.log(Authority.secretKey.toString())
  };

  const onClick = async () => {
    const candyMachine = await metaplex
      .candyMachines()
      .findByAddress({
        address: new PublicKey('7f7EHekWrmH2dTddqz9PzQNj54w4DoBJKhG2m9qwiSRG')
      });
    const transactionBuilders = [];
    for (let index = 0; index < airdrop_list.length; index++) {//將交易存入交易陣列
      const owner =new PublicKey(airdrop_list[index])
      transactionBuilders.push(
        await mintFromCandyMachineBuilder(metaplex, {
          candyMachine,
          collectionUpdateAuthority: candyMachine.authorityAddress, // mx.candyMachines().pdas().authority({candyMachine: candyMachine.address})
          //group: 'public',
          owner:owner
        })
      );
      console.log('finish:',{index})
    }
    
    console.log('finish pushing mint amount:',transactionBuilders)
    const blockhash = await metaplex.rpc().getLatestBlockhash();//取得最新的雜湊
    const transactions = transactionBuilders.map((t) =>
          t.toTransaction(blockhash)//轉換成實際交易，每筆都使用相同hash簽名
        );
    console.log('finish totransaction :',{transactions})
    const signers = {};
    transactions.forEach((tx, i) => {
      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = blockhash.blockhash;
      transactionBuilders[i].getSigners().forEach((s) => {
        if ("signAllTransactions" in s) signers[s.publicKey.toString()] = s;
        else if ("secretKey" in s) tx.partialSign(s);
        // @ts-ignore
        else if ("_signer" in s) tx.partialSign(s._signer);
      });
    });
    let signedTransactions = transactions;
    console.log('your signed transaction :',{signedTransactions})

    // const output = await Promise.all(
    //   signedTransactions.map(async (tx, i) => {
    //     const result = await metaplex.rpc().sendAndConfirmTransaction(tx, { commitment: "finalized" });
    //     return {
    //       ...result,
    //       context: transactionBuilders[i].getContext(),
    //     };
    //   })
    // );
    signedTransactions.map(async (tx, i) => {})
    console.log('finish')
    
  };

  if (!wallet.connected) {
    return null;
  }else {
    checkEligibility();
  }

  return (
    <div>
      <div>
        <div className={styles.container}>
          <div className={styles.nftForm}>
            <button onClick={onClick}>Mint Multiple</button>
          </div>
        </div>
      </div>
    </div>
  );
};
