import "./App.css";
import "./animations.css";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import React, { useEffect, useRef, useState } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

// Utility: Uint8Array to base64 (safe for large arrays)
function uint8ToBase64(uint8) {
  let binary = '';
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

function App() {
  const { ready, authenticated, user, login, logout: privyLogout } = usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Custom logout to clear state
  const logout = () => {
    setMessage("");
    setSignature("");
    setShowLogoutConfirm(false);
    privyLogout();
  };
  const [signature, setSignature] = useState("");
  const [solanaWallet, setSolanaWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [balance, setBalance] = useState(0);
  const inputRef = useRef(null);

  // Debug log for initial state
  useEffect(() => {
    console.log('Initial Privy State:', {
      ready,
      authenticated,
      user,
      hasSolanaWallets: solanaWallets?.length > 0,
    });
  }, [ready, authenticated, user, solanaWallets]);

  // Monitor solanaWallets changes
  useEffect(() => {
    console.log('Solana Wallets Changed:', {
      walletsCount: solanaWallets?.length,
      wallets: solanaWallets?.map(w => ({
        address: w.address,
        type: w.walletClientType
      }))
    });

    if (solanaWallets && solanaWallets.length > 0) {
      const firstWallet = solanaWallets[0];
      setSolanaWallet(firstWallet);
    } else {
      setSolanaWallet(null);
    }
  }, [solanaWallets]);

  // Autofocus input after login and clear signature when message changes
  useEffect(() => {
    if (authenticated && inputRef.current) {
      inputRef.current.focus();
    }
  }, [authenticated]);

  useEffect(() => {
    setSignature("");
  }, []);

  // Fetch Solana balance when wallet or cluster changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (!solanaWallet || !solanaWallet.address) {
        return;
      }

      try {
        // Use Alchemy RPC endpoint
        const rpcUrl = `https://solana-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`; // Replace API_TOKEN with your Alchemy API key
        const connection = new Connection(rpcUrl, {
          commitment: "confirmed",
          wsEndpoint: undefined,
          httpHeaders: {
            "Accept": "application/json"
          }
        });
        
        console.log('RPC Endpoint:', rpcUrl);
        console.log('Connection Status:', {
          rpcEndpoint: connection.rpcEndpoint,
          commitment: connection.commitment,
        });
        
        const pubkey = new PublicKey(solanaWallet.address);
        console.log('Fetching balance for:', pubkey.toBase58());
        
        const lamports = await connection.getBalance(pubkey);
        console.log('Balance in lamports:', lamports);
        setBalance(lamports / 1e9); // Convert lamports to SOL
      } catch (e) {
        setBalance(0);
      }
    };
    fetchBalance();
  }, [solanaWallet]);

  const connectWalletWithEmailAndSolana = async () => {
    setIsLoading(true);
    try {
      await login({
        loginMethods: ['wallet', 'email'],
        walletChainType: 'solana-only',
        disableSignup: false // allow auto account creation
      });
    } catch (error) {
      setSignature("Error connecting wallet: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signMessage = async () => {
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
      setMessage(""); // Clear message after signing for better UX
    } catch (error) {
      setSignature(`Error signing message: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="App" style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #000000 0%, #0a0a0a 100%)",
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <header className="App-header" style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px"
      }}>
        {/* Branding */}
        <div style={{
          marginBottom: "40px",
          textAlign: "center",
          animation: "fadeIn 0.5s ease-out"
        }}>
          <h1 style={{
            fontSize: "42px",
            fontWeight: "700",
            background: "linear-gradient(135deg, #fff 0%, #10913b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "0 0 8px 0"
          }}>
            Revi DApps
          </h1>
          <p style={{
            color: "#666",
            fontSize: "16px",
            margin: 0
          }}>
            Secure Solana Wallet Interface
          </p>
        </div>

        {ready && authenticated ? (
          <div style={{ 
            maxWidth: "800px", 
            width: "100%",
            padding: "24px",
            background: "#0d0d0d",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(16, 145, 59, 0.15)",
            animation: "slideUp 0.5s ease-out",
            transform: "translateY(0)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            ":hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 12px 48px rgba(16, 145, 59, 0.2)"
            }
          }}>
            {/* Wallet Info Section */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
              padding: "16px",
              background: "#25262b",
              borderRadius: "8px",
            }}>
              <div>
                <h3 style={{ margin: "0 0 8px 0", color: "#fff" }}>Connected Wallet</h3>
                {solanaWallet && (
                  <div style={{ color: "#a6a7ab", fontSize: "14px" }}>
                    {solanaWallet.address}
                  </div>
                )}
              </div>
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end"
              }}>
                {solanaWallet && (
                  <div style={{ 
                    color: "#FFD700",
                    fontSize: "24px",
                    fontWeight: "600",
                    marginBottom: "4px"
                  }}>
                    {balance} SOL
                  </div>
                )}
                <div style={{ position: "relative" }}>
                  <button 
                    onClick={() => setShowLogoutConfirm(true)}
                    className="btn-disconnect"
                    style={{ 
                      padding: "8px 16px",
                      backgroundColor: "#373A40",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                    }}
                    onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                    onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                  >
                    Disconnect
                  </button>

                  {/* Logout Confirmation Dialog */}
                  {showLogoutConfirm && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 10px)",
                        right: 0,
                        width: "220px",
                        padding: "16px",
                        background: "#1a1b1e",
                        borderRadius: "8px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                        animation: "fadeIn 0.2s ease-out",
                        zIndex: 10
                      }}
                    >
                      <div style={{ 
                        color: "#fff",
                        fontSize: "14px",
                        marginBottom: "12px",
                        textAlign: "center"
                      }}>
                        Are you sure you want to disconnect?
                      </div>
                      <div style={{ 
                        display: "flex",
                        gap: "8px",
                        justifyContent: "center"
                      }}>
                        <button
                          onClick={logout}
                          className="btn-primary"
                          style={{
                            padding: "8px 16px",
                            background: "linear-gradient(135deg, #10913b 0%, #0d7830 100%)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                            transition: "all 0.2s ease",
                            flex: 1
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 4px 12px rgba(16, 145, 59, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                          }}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setShowLogoutConfirm(false)}
                          style={{
                            padding: "8px 16px",
                            background: "#373A40",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                            transition: "all 0.2s ease",
                            flex: 1
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Message Signing Section */}
            <div style={{
              padding: "20px",
              background: "#25262b",
              borderRadius: "8px",
              marginBottom: "24px"
            }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#fff" }}>Sign Message</h3>
              <div style={{ marginBottom: "16px" }}>
                <input
                  id="message-input"
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Enter message to sign"
                  className="input-animate"
                  style={{ 
                    width: "97%",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #373A40",
                    background: "#1a1b1e",
                    color: "#fff",
                    fontSize: "16px",
                    marginBottom: "16px",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#10913b";
                    e.target.style.boxShadow = "0 0 0 3px rgba(16, 145, 59, 0.2)";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#373A40";
                    e.target.style.boxShadow = "none";
                    e.target.style.transform = "translateY(0)";
                  }}
                  disabled={isLoading}
                  autoComplete="off"
                />
                <button
                  onClick={signMessage}
                  disabled={!solanaWallet || isLoading || !message}
                  className="btn-primary"
                  style={{ 
                    width: "100%",
                    padding: "12px",
                    background: message ? "linear-gradient(135deg, #10913b 0%, #0d7830 100%)" : "#10913b",
                    color: "#FFF",
                    border: "none",
                    borderRadius: "6px",
                    cursor: message ? "pointer" : "not-allowed",
                    opacity: (!solanaWallet || isLoading || !message) ? "0.5" : "1",
                    transition: "all 0.3s ease",
                    fontSize: "16px",
                    boxShadow: message ? "0 4px 12px rgba(16, 145, 59, 0.3)" : "none",
                    transform: "translateY(0)"
                  }}
                  onMouseEnter={(e) => {
                    if (message && !isLoading) {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 16px rgba(16, 145, 59, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (message && !isLoading) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 12px rgba(16, 145, 59, 0.3)";
                    }
                  }}
                >
                  {isLoading ? "Signing..." : "Sign Message"}
                </button>
              </div>

              {/* Signature Output */}
              <div style={{ 
                padding: "16px",
                background: "#1a1b1e",
                borderRadius: "6px",
                marginTop: "16px",
                opacity: signature ? "1" : "0",
                height: signature ? "auto" : "0",
                transform: signature ? "translateY(0)" : "translateY(-10px)",
                transition: "all 0.3s ease",
                overflow: "hidden"
              }}>
                <div style={{ 
                  color: "#a6a7ab",
                  fontSize: "14px",
                  marginBottom: signature ? "8px" : "0"
                }}>
                  Signature
                </div>
                {signature && (
                  <div style={{ 
                    color: "#fff",
                    wordBreak: "break-all",
                    fontFamily: "monospace",
                    fontSize: "14px",
                    lineHeight: "1.4",
                    animation: "fadeIn 0.3s ease-out"
                  }}>
                    {signature}
                  </div>
                )}
              </div>
            </div>

            {/* Debug Info */}
            <div style={{
              padding: "16px",
              background: "#25262b",
              borderRadius: "8px",
            }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#fff" }}>PrivyIO Wallet Info</h3>
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
                style={{ 
                  width: "97%",
                  height: "150px",
                  padding: "12px",
                  borderRadius: "6px",
                  border: "1px solid #373A40",
                  background: "#1a1b1e",
                  color: "#a6a7ab",
                  fontSize: "14px",
                  fontFamily: "monospace",
                  resize: "vertical"
                }}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={connectWalletWithEmailAndSolana}
            disabled={isLoading}
            className="btn-primary"
            style={{
              padding: "16px 32px",
              background: "linear-gradient(135deg, #10913b 0%, #0d7830 100%)",
              color: "#FFF",
              border: "none",
              borderRadius: "8px",
              fontSize: "18px",
              cursor: isLoading ? "wait" : "pointer",
              boxShadow: "0 4px 12px rgba(16, 145, 59, 0.3)",
              opacity: isLoading ? "0.5" : "1",
              transition: "all 0.3s ease",
              transform: "translateY(0)"
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(16, 145, 59, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(16, 145, 59, 0.3)";
              }
            }}
          >
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </header>
    </div>
  );
}

export default App;
