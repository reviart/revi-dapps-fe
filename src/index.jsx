import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

// Use Vite env variables for Solana config
const solanaCluster = import.meta.env.VITE_SOLANA_CLUSTER;
const solanaRpcUrl = import.meta.env.VITE_SOLANA_RPC_URL;

const solanaChain = {
  name: 'Solana',
  id: `solana-${solanaCluster}`,
  type: 'solana',
  chainId: 101,
  rpcUrls: [solanaRpcUrl],
  cluster: solanaCluster
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      onSuccess={(user) => console.log(`User ${user.id} logged in!`)}
      config={{
        supportedChains: [solanaChain],
        defaultChain: solanaChain,
        solanaClusters: [{
          name: solanaCluster,
          rpcUrl: solanaRpcUrl
        }],
        externalWallets: {
          solana: {
            enabled: true,
            connectors: toSolanaWalletConnectors({})
          }
        }
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
);

reportWebVitals();
