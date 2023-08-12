import styles from "../styles/Home.module.css";
import React, { useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { MetaplexProvider } from "./MetaplexProvider";
import { MintNFTs } from "./MintNFTs";
import "@solana/wallet-adapter-react-ui/styles.css";
import dynamic from 'next/dynamic';
import { Multiple } from './mint_multiple'
import { Claim_token } from './claim_token'
import { Vthree } from "./mint_v3";
import { Init } from "./staking";
export default function Home() {
 
  const [network, setNetwork] = useState(WalletAdapterNetwork.Devnet);

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  const handleChange = (event) => {
    switch (event.target.value) {
      case "devnet":
        setNetwork(WalletAdapterNetwork.Devnet);
        break;
      case "mainnet":
        setNetwork(WalletAdapterNetwork.Mainnet);
        break;
      case "testnet":
        setNetwork(WalletAdapterNetwork.Testnet);
        break;
      default:
        setNetwork(WalletAdapterNetwork.Devnet);
        break;
    }
  };
  
  const ButtonWrapper = dynamic(() =>
    import('@solana/wallet-adapter-react-ui', { ssr: false }).then((mod) => mod.WalletMultiButton)
  );

  return (
    <div>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <MetaplexProvider>
              <div className={styles.App}>
                <ButtonWrapper />
                {/* <MintNFTs onClusterChange={handleChange} />
                <Claim_token onClusterChange={handleChange} />
                <Create_token onClusterChange={handleChange} /> */}
                {/* <Vthree onClusterChange={handleChange} /> */}
                <Multiple onClusterChange={handleChange} />
                <Vthree onClusterChange={handleChange} />
                <Init onClusterChange={handleChange} />
              </div>
            </MetaplexProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}
