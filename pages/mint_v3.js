import styles from '../styles/Home.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from "react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { some , transactionBuilder , publicKey , generateSigner , none , sol , dateTime , percentAmount ,signAllTransactions, addTransactionSignature, signTransaction,TransactionBuilder,base58PublicKey } from "@metaplex-foundation/umi";
import { fetchCandyMachine , fetchCandyGuard , mintV2, updateCandyGuard , mplCandyMachine , updateCandyMachine, getMerkleRoot, route, getMerkleProof ,mintFromCandyMachineV2} from "@metaplex-foundation/mpl-candy-machine";
import { setComputeUnitLimit , createMintWithAssociatedToken, findAssociatedTokenPda } from "@metaplex-foundation/mpl-essentials";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { nftStorageUploader } from "@metaplex-foundation/umi-uploader-nft-storage";
import { setTokenStandard,setCollectionV2 } from "@metaplex-foundation/mpl-candy-machine";
import { Metaplex } from '@metaplex-foundation/js';
import bs58 from "bs58"
import { PublicKey,Keypair } from "@solana/web3.js";

export const Vthree= ({ onClusterChange }) => {
    const [paymentOption, setPaymentOption] = useState("token");

    const wallet = useWallet();
    //const umi = createUmi(clusterApiUrl('devnet'),'confirmed').use(mplCandyMachine());
    const umi = createUmi('https://api.devnet.solana.com')
    .use(walletAdapterIdentity(wallet))
    //.use(nftStorageUploader())
    .use(mplCandyMachine());
    
    const checkEligibility = async () => {
        const candyMachine = await fetchCandyMachine(umi, publicKey("FA3Tfv8CQjmrmhh56aPMSNJbuN87RzrwJG9NkTdsKf3V"));
        // const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);
        // console.log(candyMachine)
        // console.log(candyGuard)
        // const myWalletSecretKey = bs58.decode('2jgPdKQQE9fqgj8jtj6hESw8z7ibv7b6rQVxpPgxrTjGqyeq61uVcqGbm7JQ7egiD3cwFYbtPcQotyJEX9QbUXdv'); //私鑰轉回錢包keypair，帳戶名creator-cndmhV3
        // const Authority = Keypair.fromSecretKey(myWalletSecretKey);
        // console.log(Authority.secretKey)

    };

    const UpdateGuard = async () => {     
        const candyMachine = await fetchCandyMachine(umi, publicKey("FA3Tfv8CQjmrmhh56aPMSNJbuN87RzrwJG9NkTdsKf3V"));
        const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);
        console.log(candyGuard)
        const wl =[
            'F4rMWNogrJ7bsknYCKEkDiRbTS9voM7gKU2rcTDwzuwf',
            '38xYvEUfiEH6hKqtJ4xVCkGg18nsDDTSi8pkW5GbM628'
        ]
        await updateCandyGuard(umi, {
        candyGuard: candyGuard.publicKey,
        guards: {
            tokenStandard: TokenStandard.NonFungible,
            botTax: none(),
            collectionUpdateAuthority: publicKey('F4rMWNogrJ7bsknYCKEkDiRbTS9voM7gKU2rcTDwzuwf'),
            creators: [
                { address: publicKey("Se9gzT3Ep3E452LPyYaWKYqcCvsAwtHhRQwQvmoXFxG"), percentageShare: 100, verified: false },
                ],
            },
        groups: [
            {
                label: "wlt",
                guards: {
                    startDate: some({ date: dateTime("2022-10-18T16:00:00Z") }),
                    allowList:some({merkleRoot:getMerkleRoot(wl)}),
                    tokenPayment:some({
                        amount :1000000000,
                        mint:new PublicKey('D8J6gcTSLPwXS9h4afZvDEQr2qGxscVfUPnrfbHQxhzJ'),
                        destinationAta:findAssociatedTokenPda(umi,{
                            mint:new PublicKey('D8J6gcTSLPwXS9h4afZvDEQr2qGxscVfUPnrfbHQxhzJ'),
                            owner:umi.identity.publicKey
                        })
                    })
                },
            },
            {
                label: "pubt",
                guards: {
                    startDate: some({ date: dateTime("2022-10-18T16:00:00Z") }),
                    tokenPayment:some({
                        amount :1000000000,
                        mint:new PublicKey('D8J6gcTSLPwXS9h4afZvDEQr2qGxscVfUPnrfbHQxhzJ'),
                        destinationAta:findAssociatedTokenPda(umi,{
                            mint:new PublicKey('D8J6gcTSLPwXS9h4afZvDEQr2qGxscVfUPnrfbHQxhzJ'),
                            owner:umi.identity.publicKey
                        })
                    })
                },
            },
            {
                label: "wl",
                guards: {
                    allowList:some({merkleRoot:getMerkleRoot(wl)}),
                    startDate: some({ date: dateTime("2022-10-18T16:00:00Z") }),
                    solPayment: some({ lamports: sol(0.01), destination : umi.identity.publicKey }),
                },
            },
            {
                label: "public",
                guards: {
                    startDate: some({ date: dateTime("2022-10-18T17:00:00Z") }),
                    solPayment: some({ lamports: sol(0.01), destination : umi.identity.publicKey }),
                },
            },
            ],
        }).sendAndConfirm(umi);
        console.log(candyMachine)
        console.log(candyGuard)
    };
    const UpdateStandard = async () => {     
        const candyMachine = await fetchCandyMachine(umi, publicKey("CacmU7gct5RGdESvL5ypHBEJKZYUDUf7rDJ99tKtDJwj"));

        await setTokenStandard(umi,{
            candyMachine:candyMachine.publicKey,
            collectionMint:candyMachine.collectionMint,
            collectionUpdateAuthority:umi.identity,
            tokenStandard:TokenStandard.ProgrammableNonFungible
            }).sendAndConfirm(umi);
        console.log(candyMachine)
    };
    const mint = async () => {
        const candyMachine = await fetchCandyMachine(umi, publicKey("GB2EY4Dsz71oAtuNpNMVps1hmsd3ivi4Nji6fCNFsFJ4"));
        const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);
        const nftMint = generateSigner(umi);
        const wl =[
            'F4rMWNogrJ7bsknYCKEkDiRbTS9voM7gKU2rcTDwzuwf',
            '38xYvEUfiEH6hKqtJ4xVCkGg18nsDDTSi8pkW5GbM628'
        ]
        let pay = '';
        if (paymentOption === "wl-token") {
            const tx = transactionBuilder()
            .add(setComputeUnitLimit(umi, { units: 800_000 }))
            .add(createMintWithAssociatedToken(umi, { mint: nftMint, owner: publicKey(umi.identity) }))
            .add(
                route(umi,{
                    candyMachine:candyMachine.publicKey,
                    candyGuard:candyGuard.publicKey,
                    guard: "allowList",
                    group:some('wlt'),
                    routeArgs:{
                        path:"proof",
                        merkleRoot:getMerkleRoot(wl),
                        merkleProof:getMerkleProof(wl,base58PublicKey(umi.identity))
                    }
                }))
            // .add(
            //     mintV2(umi,{
            //     candyMachine: candyMachine.publicKey,
            //     nftMint: nftMint,
            //     collectionMint: candyMachine.collectionMint,//Collection NFT 的鑄幣賬戶地址
            //     collectionUpdateAuthority: candyMachine.authority, 
            //     group: some("wlt"),
            //     candyGuard:candyGuard.publicKey,
            //     tokenStandard: TokenStandard.ProgrammableNonFungible,
            //     mintArgs: {
            //         allowList: some({ merkleRoot: getMerkleRoot(wl) }),
            //         tokenPayment:some({
            //             mint:new PublicKey('D8J6gcTSLPwXS9h4afZvDEQr2qGxscVfUPnrfbHQxhzJ'),
            //             destinationAta:findAssociatedTokenPda(umi,{
            //                 mint:new PublicKey('D8J6gcTSLPwXS9h4afZvDEQr2qGxscVfUPnrfbHQxhzJ'),
            //                 owner:new PublicKey('F4rMWNogrJ7bsknYCKEkDiRbTS9voM7gKU2rcTDwzuwf')
            //             })
            //         })
            //     },
            // }))
            pay = tx
        } else if (paymentOption === "wl-sol") {
            const tx = transactionBuilder()
            .add(setComputeUnitLimit(umi, { units: 800_000 }))
            .add(createMintWithAssociatedToken(umi, { mint: nftMint, owner: publicKey(umi.identity) }))
            .add(
                route(umi,{
                    candyMachine:candyMachine.publicKey,
                    candyGuard:candyGuard.publicKey,
                    guard: "allowList",
                    group:some('wl'),
                    routeArgs:{
                        path:"proof",
                        merkleRoot:getMerkleRoot(wl),
                        merkleProof:getMerkleProof(wl,base58PublicKey(umi.identity))
                    }
                }))
            .add(
                mintV2(umi,{
                candyMachine: candyMachine.publicKey,
                nftMint: nftMint,
                collectionMint: candyMachine.collectionMint,//Collection NFT 的鑄幣賬戶地址
                collectionUpdateAuthority: candyMachine.authority, 
                group: some("wl"),
                candyGuard:candyGuard.publicKey,
                tokenStandard: TokenStandard.ProgrammableNonFungible,
                mintArgs: {
                    solPayment: some({ destination: publicKey('F4rMWNogrJ7bsknYCKEkDiRbTS9voM7gKU2rcTDwzuwf') }),
                    allowList: some({ merkleRoot: getMerkleRoot(wl) }),
                },
            }))
            pay = tx
        } else if (paymentOption === "public-token") {
            const tx = transactionBuilder()
            .add(setComputeUnitLimit(umi, { units: 800_000 }))
            .add(createMintWithAssociatedToken(umi, { mint: nftMint, owner: publicKey(umi.identity) }))
            .add(
                mintV2(umi,{
                candyMachine: candyMachine.publicKey,
                nftMint: nftMint,
                collectionMint: candyMachine.collectionMint,//Collection NFT 的鑄幣賬戶地址
                collectionUpdateAuthority: candyMachine.authority, 
                group: some("pubt"),
                candyGuard:candyGuard.publicKey,
                tokenStandard: TokenStandard.ProgrammableNonFungible,
                mintArgs: {
                    tokenPayment:some({
                        mint:new PublicKey('D8J6gcTSLPwXS9h4afZvDEQr2qGxscVfUPnrfbHQxhzJ'),
                        destinationAta:findAssociatedTokenPda(umi,{
                            mint:new PublicKey('D8J6gcTSLPwXS9h4afZvDEQr2qGxscVfUPnrfbHQxhzJ'),
                            owner:new PublicKey('F4rMWNogrJ7bsknYCKEkDiRbTS9voM7gKU2rcTDwzuwf')
                        })
                    })
                },
            }))
            pay = tx
        } else if (paymentOption === "public-sol") {
            const tx = transactionBuilder()
            .add(setComputeUnitLimit(umi, { units: 800_000 }))
            .add(createMintWithAssociatedToken(umi, { mint: nftMint, owner: publicKey(umi.identity) }))
            .add(
                mintV2(umi,{
                candyMachine: candyMachine.publicKey,
                nftMint: nftMint,
                collectionMint: candyMachine.collectionMint,//Collection NFT 的鑄幣賬戶地址
                collectionUpdateAuthority: candyMachine.authority, 
                group: some("public"),
                candyGuard:candyGuard.publicKey,
                tokenStandard: TokenStandard.ProgrammableNonFungible,
                mintArgs: {
                    solPayment: some({ destination: publicKey('F4rMWNogrJ7bsknYCKEkDiRbTS9voM7gKU2rcTDwzuwf') }),
                },
            }))
            pay = tx
        }
        const { signature } = await pay.sendAndConfirm(umi, {
            confirm: { commitment: "finalized" }, send: {
                skipPreflight: true,
            },
            });
    };

    const try_mult = async () => {
        const candyMachine = await fetchCandyMachine(umi, publicKey("8oi8Gh7BvejVaVoyZ1iTi4sbXv6dshGPsTtZwsKXvPme"));
        const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);
        const nftMint = generateSigner(umi);
        const transactionBuilders = [];
        for (let index = 0; index < 2; index++) {
            transactionBuilders.push(
                transactionBuilder()
                .add(setComputeUnitLimit(umi, { units: 800_000 }))
                .add(createMintWithAssociatedToken(umi, { mint: nftMint, owner: publicKey(umi.identity) }))
                .add(
                    mintV2(umi,{
                    candyMachine: candyMachine.publicKey,
                    nftMint: nftMint,
                    collectionMint: candyMachine.collectionMint,//Collection NFT 的鑄幣賬戶地址
                    collectionUpdateAuthority: candyMachine.authority,
                    //group: some("public"),
                    candyGuard:candyGuard.publicKey,
                    tokenStandard: TokenStandard.ProgrammableNonFungible,
                    mintArgs: {
                        mintLimit: some({ id: 1 }),
                        solPayment: some({ destination: publicKey('9MMdJHMK22JtrU8H4QLFYgZUoFcwXtutvjtrVNcjcRc9') }),
                    },
                }))
            );
            transactionBuilders[index] = await transactionBuilders[index].setLatestBlockhash(umi);
            transactionBuilders[index] = transactionBuilders[index].setFeePayer(umi.identity);
            }

        const transactions = [];
        for (let index = 0; index < 2; index++) {
            transactions.push(
                umi.transactions.create({
                    version:0,
                    blockhash:(await umi.rpc.getLatestBlockhash()).blockhash,
                    instructions:transactionBuilders[index].getInstructions(umi),
                    payer:publicKey(umi.identity)
                })
            )
        }
        const transactionsToSign = [];
        for (let i = 0; i < transactions.length; i++) {
            transactionsToSign.push(
            { transaction: transactions[i], signers:[umi.payer] }//transactionBuilders[i].getSigners()[0]和umi.identity的結構一樣
            );
        }
        const signedTransactions = await signAllTransactions(transactionsToSign);
        console.log('my signed transactions : ',signedTransactions);

        const output = await Promise.all(
            signedTransactions.map(async (tx) => {
                const signature = await umi.rpc.sendTransaction(tx);
                const confirmResult = await umi.rpc.confirmTransaction(signature, {
                strategy: { type: 'blockhash', ...(await umi.rpc.getLatestBlockhash()) }
                });
                return {
                ...confirmResult,
                };
            })
            );
        console.log('finish')
    }
    const onClick4 = async () => {
        const candyMachine = await fetchCandyMachine(umi, publicKey("A7JGz5JEMhDSihzaHHnXUrrYWFcGetuV99HiwrDYmLNn"));
        const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);
        const nftMint = generateSigner(umi);
        const builder = transactionBuilder()
            .add(setComputeUnitLimit(umi, { units: 800_000 }))
            .add(createMintWithAssociatedToken(umi, { mint: nftMint, owner: publicKey(umi.identity) }))
            .add(
                mintV2(umi,{
                candyMachine: candyMachine.publicKey,
                nftMint: nftMint,
                collectionMint: candyMachine.collectionMint,//Collection NFT 的鑄幣賬戶地址
                collectionUpdateAuthority: candyMachine.authority, 
                //group: some("public"),
                candyGuard:candyGuard.publicKey,
                tokenStandard: TokenStandard.ProgrammableNonFungible,
                mintArgs: {
                    mintLimit: some({ id: 1 }),
                    solPayment: some({ destination: publicKey('9MMdJHMK22JtrU8H4QLFYgZUoFcwXtutvjtrVNcjcRc9') }),
                },
            })
        )
        //const signers = builder.getSigners(umi);
        //console.log('signers : ',signers)
        const transaction = umi.transactions.create({
            version:0,
            blockhash:(await umi.rpc.getLatestBlockhash()).blockhash,
            instructions:builder.getInstructions(umi),
            payer:publicKey(umi.identity)
        })//等於builder = await builder.setLatestBlockhash(umi); const transaction = builder.build(umi)
        const signedtransactions = await signAllTransactions([
            { transaction:transaction,signers:[umi.identity] }
        ])
        const signature = await umi.rpc.sendTransaction(signedtransactions);
        const confirmResult = await umi.rpc.confirmTransaction(signature, {
            strategy: { type: 'blockhash', ...(await umi.rpc.getLatestBlockhash()) }
            });
        console.log('finish')
    }
    const onClick5 = async () => {
        const candyMachine = await fetchCandyMachine(umi, publicKey("A7JGz5JEMhDSihzaHHnXUrrYWFcGetuV99HiwrDYmLNn"));
        const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);
        console.log(candyMachine)
        console.log(candyGuard)
        const wl =[
            'F4rMWNogrJ7bsknYCKEkDiRbTS9voM7gKU2rcTDwzuwf',
            '38xYvEUfiEH6hKqtJ4xVCkGg18nsDDTSi8pkW5GbM628'
        ]
        await route(umi,{
            candyMachine:candyMachine.publicKey,
            candyGuard:candyGuard.publicKey,
            guard: "allowList",
            group:'wl',
            routeArgs:{
                path:"proof",
                merkleRoot:getMerkleRoot(wl),
                merkleProof:getMerkleProof(wl,base58PublicKey(umi.identity))
            }
        }).sendAndConfirm(umi)
        
    };
    const onMint = async () => {
      
        const candyMachine = await fetchCandyMachine(umi, publicKey("AYDjUcSoX34B4xQXPodRzgLFdQBjJuvksEdo2PuLoaBS"));
        console.log(candyMachine);
      
        const nftMint = generateSigner(umi);
        const nftOwner = generateSigner(umi).publicKey;
      
        await transactionBuilder()
          .add(setComputeUnitLimit(umi, { units: 800_000 }))
          .add(
            mintV2(umi,{
                candyMachine: candyMachine.publicKey,
                nftMint: nftMint,
                collectionMint: candyMachine.collectionMint,//Collection NFT 的鑄幣賬戶地址
                collectionUpdateAuthority: candyMachine.authority,
                tokenStandard: TokenStandard.ProgrammableNonFungible,
            })
          )
          .sendAndConfirm(umi);
      
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
                <button onClick={UpdateStandard}>更新standard</button>
                <button onClick={UpdateGuard}>更新guard</button>
                {/* <button onClick={mint}>mintv2</button> */}
                {/* <button onClick={try_mult}>multi mint</button>
                <button onClick={onClick4}>eee</button>
                <button onClick={onClick5}>eees</button> */}
                <select value={paymentOption} onChange={(e) => setPaymentOption(e.target.value)}>
                    <option value="wl-token">wl Token</option>
                    <option value="wl-sol">wl SOL</option>
                    <option value="public-token">public token</option>
                    <option value="public-sol">public SOL</option>
                </select>
                <button onClick={mint}>mintv2</button>
                {/* <button onClick={onMint}>ssssdkowepfjiwejf</button> */}
            </div>
            </div>
        </div>
        </div>
    );
};