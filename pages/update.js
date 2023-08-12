import styles from '../styles/Home.module.css';
import { useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair,LAMPORTS_PER_SOL, Connection, clusterApiUrl } from "@solana/web3.js";
import { nftStorage } from "@metaplex-foundation/js-plugin-nft-storage";//npm install @metaplex-foundation/js-plugin-nft-storage
import { useMetaplex } from "./useMetaplex";
import { sol, toBigNumber, toDateTime, usd } from "@metaplex-foundation/js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import bs58 from "bs58";

export const Update_candymachine= ({ onClusterChange }) => {
  const creator = new PublicKey('99crpNweSPYkQeyU9i93GMyFyMedetoTG25jLQg11ruB');
  const OGwallet = new PublicKey('4GovyFfzG44sUytPmCC3oZgC4rP4xBtgxBTXw1W9iJZU');
  const WLwallet = new PublicKey('FRpLQrS7x81aLwHTAgJtjR55o9VsxfeHvsHGxr14q8iv');
  //const OGwallet = new PublicKey('D9PfxswEsvkesCtV68u49N7DgFGxuFCgPZMpiMY93h1L');
  //const WLwallet = new PublicKey('D9PfxswEsvkesCtV68u49N7DgFGxuFCgPZMpiMY93h1L');
  const computer = new PublicKey('Se9gzT3Ep3E452LPyYaWKYqcCvsAwtHhRQwQvmoXFxG');
  const wallet = useWallet();
  const { metaplex } = useMetaplex();
  metaplex.use(nftStorage());
  
  const checkEligibility = async () => {
    const connection = new Connection(clusterApiUrl('devnet'),'confirmed');
    const allnft = await metaplex.nfts().findAllByOwner({
      owner:wallet.publicKey
    })
    function call(n){
      console.log(n.length)
    }
    connection.onProgramAccountChange( 
      TOKEN_PROGRAM_ID,
      call(allnft),
      ({ accountId }) => {
        console.log('Program change', accountId.toString())
      },
      'confirmed'
      )
  };
  const UpdateGuard = async () => {
      console.log('找糖果機')
      const candyMachine = await metaplex
      .candyMachines()
      .findByAddress({
        address: new PublicKey("4QGXSet1N1f35iERow18WxyM3TP1TdBst6c6YWhBqci2") 
      });
      console.log(candyMachine.address.toString())
      console.log('更新糖果機的守衛')
      await metaplex.candyMachines().update({
          candyMachine,
          sellerFeeBasisPoints:40,
          Authority:candyMachine.authorityAddress,
          guards:{
          },
          groups: [
              {
                label: 'WL',
                guards: {
                  
                  botTax: { lamports: sol(0.01), lastInstruction: true },
                  solPayment: { amount: usd(0.05), destination: computer },
                  startDate: { date: toDateTime("2023-1-17T16:00:00Z") },
                }
              },
              {
                label: 'Public',
                guards: {
                  botTax: { lamports: sol(0.01), lastInstruction: true },
                  solPayment: { amount: usd(0.1), destination: computer },
                  startDate: { date: toDateTime("2023-1-18T16:00:00Z") },
                }
              }
            ]
      });
      const updatedCandyMachine = await metaplex.candyMachines()
        .refresh(candyMachine);
      console.log('更新前的糖果機：',candyMachine)
      console.log('更新後的糖果機：',updatedCandyMachine)
      console.log(candyMachine.candyGuard.address.toString())
  };
  const CreateGuard = async () => {
      console.log('找糖果機')
      const candyMachine = await metaplex
      .candyMachines()
      .findByAddress({
        address: new PublicKey("2zRp49vRuKSp6AQBPybH1hdLC1q4Hp5ie2GhrmGbT7XF") //1000
      });
      console.log(candyMachine.address.toString())
      console.log('創建守衛')
      // Create a Candy Guard.
      const { candyGuard } = await metaplex.candyMachines().createCandyGuard({
          guards:{
          },
          groups: [
            {
              label: 'OG',
              guards: {
                botTax: { lamports: sol(0.01), lastInstruction: false },
                solPayment: { amount: sol(0.05), destination: creator },
                startDate: { date: toDateTime("2023-1-17T16:00:00Z") },
                addressGate: { 
                  address: OGwallet
                },
              }
            },
            {
              label: 'WL',
              guards: {
                botTax: { lamports: sol(0.01), lastInstruction: false },
                solPayment: { amount: sol(0.01), destination: creator },
                startDate: { date: toDateTime("2023-1-18T16:00:00Z") },
                addressGate: { 
                  address: WLwallet
                },
              }
            },
            {
              label: 'public',
              guards: {
                botTax: { lamports: sol(0.01), lastInstruction: false },
                solPayment: { amount: sol(0.05), destination: creator },
                startDate: { date: toDateTime("2023-1-19T16:00:00Z") },
              }
            },
          ]
            // guards: {
            //   botTax: { lamports: sol(0.01), lastInstruction: false },
            //   solPayment: { amount: sol(0.5), destination: creator },
            //   startDate: { date: toDateTime("2022-10-17T16:00:00Z") },
            // },
      });
      console.log('合體糖果機和守衛')
      // Associate the Candy Guard with the Candy Machine.
      await metaplex.candyMachines().wrapCandyGuard({
          candyMachine: candyMachine.address,
          candyGuard: candyGuard.address,
        });
      
      const updatedCandyMachine = await metaplex.candyMachines()
        .refresh(candyMachine);
      console.log('更新後的糖果機：',updatedCandyMachine)
  }
  const Unwrap = async () => {
    console.log('找糖果機')
    const candyMachine = await metaplex
    .candyMachines()
    .findByAddress({
      address: new PublicKey("2zRp49vRuKSp6AQBPybH1hdLC1q4Hp5ie2GhrmGbT7XF") //1000
    });
    console.log('分離糖果機和守衛')

    await metaplex.candyMachines().unwrapCandyGuard({
      candyMachine: candyMachine.address,
      candyGuard: candyMachine.candyGuard.address,
    });
    
    const updatedCandyMachine = await metaplex.candyMachines()
      .refresh(candyMachine);
    console.log('更新後的糖果機：',updatedCandyMachine)
  }
    
  if (!wallet.connected) {
    return null;
  }else {
    checkEligibility();
  }

  return (
    <div>
      <div>
        <div className={styles.container_update}>
          <div className={styles.nftForm}>
            <button onClick={UpdateGuard}>更新Guard</button>
            <button onClick={CreateGuard}>創建Guard</button>
            <button onClick={Unwrap}>分離Guard</button>
          </div>
        </div>
        <div className={styles.container_update}>
          <div className={styles.nftForm}>
          </div>
        </div>
      </div>
    </div>
  );
}