import React, { useState, useEffect } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from 'react-router-dom';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function LandingPage() {
  const { login, ready, authenticated } = usePrivy();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authenticated) {
      navigate('/dashboard');
    }
  }, [authenticated, navigate]);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-neutral-900 font-sans">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-green-600 bg-clip-text text-transparent">
              Revi DApps
            </span>
          </h1>
          <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto">
            Connect, manage, and interact with your Solana wallet securely. Built for seamless blockchain interactions.
          </p>
          
          {/* Error Display */}
          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}
          
          {/* CTA Button */}
          <button
            onClick={async () => {
              setIsLoading(true);
              setError("");
              try {
                await login({
                  loginMethods: ['wallet', 'email'],
                  walletChainType: 'solana-only',
                  disableSignup: false
                });
              } catch (error) {
                setError(error.message || "Failed to connect wallet");
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="group relative px-8 py-4 rounded-xl bg-green-600 text-white text-lg 
              transition-all duration-300 ease-in-out
              hover:bg-green-500 hover:scale-[1.02]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              overflow-hidden"
          >
            <span className="flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <ArrowPathIcon className="animate-spin h-5 w-5" />
                  Connecting...
                </>
              ) : (
                <>
                  Connect Wallet
                  <span className="group-hover:translate-x-1 transition-transform duration-150 inline-block">→</span>
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
              translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700"/>
          </button>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 bg-neutral-800 rounded-xl">
              <div className="text-green-500 text-2xl mb-4">🔐</div>
              <h3 className="text-white text-xl font-semibold mb-2">Secure Authentication</h3>
              <p className="text-gray-400">Multiple login options with email and wallet support</p>
            </div>
            <div className="p-6 bg-neutral-800 rounded-xl">
              <div className="text-green-500 text-2xl mb-4">💰</div>
              <h3 className="text-white text-xl font-semibold mb-2">Wallet Management</h3>
              <p className="text-gray-400">View balances and manage your Solana assets</p>
            </div>
            <div className="p-6 bg-neutral-800 rounded-xl">
              <div className="text-green-500 text-2xl mb-4">✍️</div>
              <h3 className="text-white text-xl font-semibold mb-2">Message Signing</h3>
              <p className="text-gray-400">Sign messages securely for dApp interactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
