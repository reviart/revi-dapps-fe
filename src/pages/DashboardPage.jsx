import { useEffect, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRightStartOnRectangleIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

// Token configuration
const TOKENS = {
  SOL: {
    name: "Solana",
    symbol: "SOL",
    decimals: 9,
    icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  },
  USDC: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  },
  SANA: {
    name: "Sanafi Onchain",
    symbol: "SANA",
    decimals: 9,
    mint: "5dpN5wMH8j8au29Rp91qn4WfNq6t6xJfcjQNcFeDJ8Ct",
    icon: "https://s1.coincarp.com/logo/1/sanafi-onchain.png?style=200&v=1750385755",
  }
};

// Utility: Uint8Array to base64 (safe for large arrays)
function uint8ToBase64(uint8) {
  let binary = '';
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

export default function DashboardPage() {
  const { ready, authenticated, user, logout: privyLogout } = usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [signature, setSignature] = useState("");
  const [solanaWallet, setSolanaWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [balance, setBalance] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [copiedAddress, setCopiedAddress] = useState("");
  const inputRef = useRef(null);

  // Add copy functionality
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    console.log({
      authenticated, ready, user
    });

    if (!authenticated && ready) {
      navigate('/');
    }
  }, [authenticated, ready, user, navigate]);

  // Monitor solanaWallets changes
  useEffect(() => {
    console.log({
      solanaWallets
    });

    if (solanaWallets && solanaWallets.length > 0) {
      const firstWallet = solanaWallets[0];
      setSolanaWallet(firstWallet);
    } else {
      setSolanaWallet(null);
    }
  }, [solanaWallets]);

  // Fetch Solana balance when wallet changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (!solanaWallet || !solanaWallet.address) return;
      
      try {
        const rpcUrl = `https://solana-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`;
        const connection = new Connection(rpcUrl, {
          commitment: "confirmed",
          wsEndpoint: undefined,
          httpHeaders: { "Accept": "application/json" }
        });
        
        const pubkey = new PublicKey(solanaWallet.address);
        const lamports = await connection.getBalance(pubkey);
        setBalance(lamports / 1e9);
      } catch (e) {
        console.error("Error fetching balance:", e);
        setBalance(0);
      }
    };
    fetchBalance();
  }, [solanaWallet]);

  // Fetch token balances
  useEffect(() => {
    const fetchTokens = async () => {
      if (!solanaWallet || !solanaWallet.address) return;
      
      try {
        const rpcUrl = `https://solana-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`;
        const connection = new Connection(rpcUrl, {
          commitment: "confirmed",
          wsEndpoint: undefined,
          httpHeaders: { "Accept": "application/json" }
        });
        
        const pubkey = new PublicKey(solanaWallet.address);
        
        // Get SPL token accounts
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
          programId: TOKEN_PROGRAM_ID,
        });

        // Process token accounts
        const tokensData = tokenAccounts.value.map(({ account }) => {
          const { mint, tokenAmount } = account.data.parsed.info;
          const tokenInfo = Object.values(TOKENS).find(t => t.mint === mint);

          if (tokenInfo) {
            return {
              ...tokenInfo,
              balance: tokenAmount.uiAmount,
              address: mint
            };
          }
          return null;
        }).filter(Boolean);

        setTokens(tokensData);
      } catch (e) {
        console.error("Error fetching tokens:", e);
        setTokens([]);
      }
    };

    fetchTokens();
  }, [solanaWallet, balance]);

  const handleLogout = () => {
    setMessage("");
    setSignature("");
    setShowLogoutConfirm(false);
    privyLogout();
  };

  if (!ready || !authenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-neutral-900 font-sans">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with User Info */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-green-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="group px-4 py-2 bg-neutral-700 text-white rounded-md text-sm
                relative overflow-hidden hover:bg-neutral-600 
                transition-all duration-300 ease-in-out
                hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Disconnect
                <ArrowRightStartOnRectangleIcon 
                  className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12"
                />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700"/>
            </button>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Wallet Info Card */}
            <div className="p-6 bg-neutral-800 rounded-xl">
              <h2 className="text-white text-xl font-semibold mb-4">Wallet Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-700 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Address</div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-white font-mono text-sm break-all">
                      {solanaWallet?.address || 'Not connected'}
                    </div>
                    {solanaWallet?.address && (
                      <button
                        onClick={() => handleCopy(solanaWallet.address)}
                        className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full
                          bg-neutral-600 hover:bg-neutral-500 transition-colors"
                      >
                        {copiedAddress === solanaWallet.address ? (
                          <CheckIcon className="w-4 h-4 text-green-400" />
                        ) : (
                          <DocumentDuplicateIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-neutral-700 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Total Balance</div>
                  <div className="text-white text-2xl font-semibold">
                    {balance} USD
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Section */}
            <div className="p-6 bg-neutral-800 rounded-xl">
              <h2 className="text-white text-xl font-semibold mb-4">Portfolio</h2>
              <div className="space-y-4">
                {tokens.map((token) => (
                  <div key={token.address} className="p-4 bg-neutral-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={token.icon} 
                          alt={token.symbol} 
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.innerHTML = token.symbol[0];
                            e.target.className = "text-white text-sm font-bold";
                          }}
                        />
                        <div>
                          <div className="text-white font-semibold">{token.name}</div>
                          <div className="text-gray-400 text-sm">{token.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <div className="text-white font-semibold">
                            {token.balance.toFixed(token.decimals)} {token.symbol}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {tokens.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    No tokens found in this wallet
                  </div>
                )}
              </div>
            </div>

            {/* Message Signing Section */}
            <div className="p-6 bg-neutral-800 rounded-xl">
              <h2 className="text-white text-xl font-semibold mb-4">Sign Message</h2>
              <div className="space-y-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Enter message to sign"
                  className="w-full px-4 py-3 rounded-md border border-neutral-700 bg-neutral-900 text-white text-base focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600 transition"
                  disabled={isLoading}
                />
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      if (!solanaWallet) {
                        setSignature("No Solana wallet connected.");
                        return;
                      }
                      const msg = message || "Sign this message with your Solana wallet!";
                      const messageBytes = new TextEncoder().encode(msg);
                      const result = await solanaWallet.signMessage(messageBytes);
                      const sig = result instanceof Uint8Array ? result : result.signature;
                      const finalResult = uint8ToBase64(sig);
                      setSignature(finalResult);
                      setMessage("");
                    } catch (error) {
                      setSignature(`Error signing message: ${error.message}`);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={!solanaWallet || isLoading || !message}
                  className="group relative w-full py-3 px-4 rounded-md bg-green-600
                    text-white font-semibold
                    transition-all duration-300 ease-in-out
                    hover:bg-green-500 hover:scale-[1.02]
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                    overflow-hidden"
                >
                  <span className="flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Signing...
                      </>
                    ) : (
                      <>
                        Sign Message
                        <PencilIcon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                      </>
                    )}
                  </span>
                </button>
              </div>

              {/* Signature Output */}
              {signature && (
                <div className="mt-4 p-4 bg-neutral-900 rounded-md">
                  <div className="text-gray-400 text-sm mb-2">Signature</div>
                  <div className="text-white break-all font-mono text-sm">
                    {signature}
                  </div>
                </div>
              )}
            </div>

            {/* PrivyIO Wallet Info Section */}
            <div className="p-6 bg-neutral-800 rounded-xl">
              <h2 className="text-white text-xl font-semibold mb-4">PrivyIO Wallet Info</h2>
              <textarea
                readOnly
                value={JSON.stringify({
                  user,
                  solanaWallet: solanaWallet ? {
                    address: solanaWallet.address,
                    type: 'solana',
                    balance,
                  } : null
                }, null, 2)}
                className="w-full h-36 p-3 rounded-md border border-neutral-700 bg-neutral-900 text-gray-400 text-sm font-mono resize-vertical"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-800 rounded-xl p-6 max-w-sm w-full animate-scaleIn">
            <h3 className="text-white text-lg font-semibold mb-4">Confirm Disconnect</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to disconnect your wallet?</p>
            <div className="flex gap-4">
              <button
                onClick={handleLogout}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md
                  transition-all duration-300 ease-in-out
                  hover:bg-red-500 hover:scale-105"
              >
                Disconnect
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 px-4 bg-neutral-600 text-white rounded-md
                  transition-all duration-300 ease-in-out
                  hover:bg-neutral-500 hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
