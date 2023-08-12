import styles from '../styles/Home.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair } from "@solana/web3.js";
import { nftStorage } from "@metaplex-foundation/js-plugin-nft-storage";//npm install @metaplex-foundation/js-plugin-nft-storage
import { useMetaplex } from "./useMetaplex";
import bs58 from "bs58";
import { Connection,Transaction } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, mintTo, transfer,createTransferInstruction } from '@solana/spl-token';

export const Claim_token= ({ onClusterChange }) => {
    const wallet = useWallet();
    const { metaplex } = useMetaplex();
    metaplex.use(nftStorage());
    const myWalletSecretKey = bs58.decode('2NPirTYggNg33osSYZQM9SmLGRYbfjQ3UC83rSXAsxQWumHWcnGachXZEEV2ZqHgrBfHYcRvHJ1CgnGTUvD6ycwP'); //私鑰轉回錢包keypair，帳戶名computer
    const checkEligibility = async () => {
    };
    const onClick = async () => {
        (async () => {
            //const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
            const QUICKNODE_RPC = 'https://neat-powerful-scion.solana-devnet.discover.quiknode.pro/477008fb6739aaf91aef42fecac435785492accb/';
            const connection = new Connection(QUICKNODE_RPC);

            const fromWallet = Keypair.fromSecretKey(myWalletSecretKey);
            //const mint = await createMint(connection, fromWallet, fromWallet.publicKey, null, 9);
            const mint =new PublicKey('8n7GxVW3ce7vTJ8BDpuiFBfuJFUEdGcNj4cW6vhDS6qk')
            const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                fromWallet,
                mint,
                fromWallet.publicKey
              );
            const toTokenAccount = await getOrCreateAssociatedTokenAccount(
              connection,
              fromWallet,
              mint, 
              wallet.publicKey
              );

            console.log(`Creating and Sending Transaction`);
            const tx = new Transaction();
            tx.add(createTransferInstruction(
              fromTokenAccount.address,
              toTokenAccount.address,
              fromWallet.publicKey,
              1000000000*50,
            ))
            const latestBlockHash = await connection.getLatestBlockhash('confirmed');
            tx.recentBlockhash = latestBlockHash.blockhash;    
            tx.feePayer = wallet.publicKey;
            console.log('feepayer: ',tx.feePayer.toString())
            console.log('blockhash: ',tx.recentBlockhash)
            await wallet.sendTransaction(
              tx,
              connection,
              {
                signers:[fromWallet]
              }
              )
            console.log('finish transfer')
        })();
        }

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
           
          </div>
        </div>
      </div>
    </div>
  );
};
