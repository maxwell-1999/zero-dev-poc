import React from "react";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { infuraProvider } from "wagmi/providers/infura";
import { polygonMumbai } from "wagmi/chains";
import {
  connectorsForWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import {
  googleWallet,
  facebookWallet,
  githubWallet,
  discordWallet,
  twitchWallet,
  twitterWallet,
  enhanceWalletWithAAConnector,
} from "@zerodev/wagmi/rainbowkit";
import { publicProvider } from "wagmi/providers/public";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
export const projectId = "b5486fa4-e3d9-450b-8428-646e757c10f6";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygonMumbai],
  [publicProvider()]
);

const connectors = connectorsForWallets([
  {
    groupName: "EOA Wrapped with AA",
    wallets: [
      enhanceWalletWithAAConnector(metaMaskWallet({ chains, projectId }), {
        projectId,
      }),
    ],
  },
  {
    groupName: "Social (AA)",
    wallets: [googleWallet({ options: { projectId } })],
  },
]);

const config = createConfig({
  autoConnect: false,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function ZeroDevWrapper({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider
        theme={darkTheme()}
        chains={chains}
        modalSize="compact"
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default ZeroDevWrapper;
