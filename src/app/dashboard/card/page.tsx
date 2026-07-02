'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, ShieldAlert, ShieldCheck, Activity, Eye, EyeOff, Info } from 'lucide-react';
import Link from 'next/link';

interface CardDetails {
  id: string;
  cardId: string;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export default function CardPage() {
  const [cardId, setCardId] = useState('');
  const [status, setStatus] = useState<'idle' | 'activating' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED'>('UNVERIFIED');
  const [userName, setUserName] = useState('Valued Member');
  const [card, setCard] = useState<CardDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchCardStatus = async () => {
    try {
      const res = await fetch('/api/card/activate');
      if (res.ok) {
        const data = await res.json();
        setVerificationStatus(data.verificationStatus);
        setUserName(data.userName);
        setCard(data.card);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCardStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardId) return;

    setStatus('activating');
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/card/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setCard(data.card);
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Activation request failed.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Internal server error.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading card details...</p>
      </div>
    );
  }

  // Case 1: User is not verified
  if (verificationStatus !== 'APPROVED') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Crypto Card</h1>
          <p className="text-gray-400">
            Activate a premium virtual Crypto Card to spend your digital assets in the real world.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 mb-2">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white">Identity Verification Required</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              To request or activate a virtual Crypto Card, your profile must be fully verified. This is a standard security check to protect your account and comply with financial regulations.
            </p>
          </div>

          <div className="pt-4">
            <Link 
              href="/dashboard/verify" 
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Verify Identity Now</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Card request exists and is pending
  if (card && card.status === 'PENDING') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Crypto Card</h1>
          <p className="text-gray-400">
            Track your Crypto Card status and activation details.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Grayscale/blurry mock card to represent pending state */}
          <div className="mx-auto max-w-sm aspect-[1.586/1] w-full rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 shadow-2xl relative overflow-hidden opacity-60 filter saturate-50 select-none">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1 text-left">
                <p className="text-[10px] text-gray-500 tracking-wider">HUGHVEST</p>
                <div className="w-8 h-6 bg-gray-700/50 rounded-md" />
              </div>
              <p className="text-xs font-semibold text-gray-500 tracking-widest">PREMIUM CRYPTO</p>
            </div>
            
            <div className="text-left mb-6 font-mono text-xl tracking-widest text-gray-400 select-all">
              •••• •••• •••• {card.cardId.slice(-4) || 'CARD'}
            </div>
            
            <div className="flex justify-between items-end">
              <div className="text-left">
                <p className="text-[8px] text-gray-600">CARD HOLDER</p>
                <p className="text-sm font-semibold tracking-wide text-gray-400">{userName.toUpperCase()}</p>
              </div>
              <div className="w-10 h-6 bg-gray-700/30 rounded-full" />
            </div>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white">Activation Requested</h2>
            <p className="text-gray-400 text-sm">
              Your Crypto Card (ID: <span className="font-mono text-emerald-400">{card.cardId}</span>) is currently pending admin approval. This check usually takes less than 24 hours.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <span className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>Status: Pending Review</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Card is active
  if (card && card.status === 'ACTIVE') {
    // Generate static details based on cardId hash
    const cardNum = showDetails ? `4532 9942 1085 ${card.cardId.replace(/[^0-9]/g, '').padEnd(4, '8').slice(-4)}` : `•••• •••• •••• ${card.cardId.slice(-4)}`;
    const cvv = showDetails ? '842' : '•••';
    const expiry = '12/30';

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold mb-2">Crypto Card</h1>
            <p className="text-gray-400">
              Manage your active Crypto Card and view your virtual details.
            </p>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all"
          >
            {showDetails ? (
              <>
                <EyeOff className="w-4 h-4 text-emerald-400" />
                <span>Hide Details</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Show Details</span>
              </>
            )}
          </button>
        </div>

        {/* Premium virtual card design */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="mx-auto max-w-sm aspect-[1.586/1] w-full rounded-2xl bg-gradient-to-br from-emerald-950 via-gray-900 to-black border border-emerald-500/30 p-6 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden group hover:scale-[1.02] hover:border-emerald-500/50 transition-all duration-300 select-none">
            {/* Holographic glowing lines overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none" />
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1.5 text-left">
                <p className="text-[11px] font-bold text-emerald-400 tracking-widest font-mono">HUGHVEST</p>
                {/* Chip SVG icon */}
                <svg className="w-9 h-7 text-amber-500/80 fill-current" viewBox="0 0 100 100">
                  <rect x="10" y="20" width="80" height="60" rx="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="4" />
                  <line x1="40" y1="20" x2="40" y2="80" stroke="currentColor" strokeWidth="4" />
                  <line x1="70" y1="20" x2="70" y2="80" stroke="currentColor" strokeWidth="4" />
                </svg>
              </div>
              <p className="text-[10px] font-extrabold text-white tracking-widest bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase">
                Active
              </p>
            </div>
            
            <div className="text-left mb-6 font-mono text-xl tracking-widest text-white font-semibold select-all">
              {cardNum}
            </div>
            
            <div className="flex justify-between items-end">
              <div className="text-left">
                <p className="text-[8px] text-gray-500">CARD HOLDER</p>
                <p className="text-sm font-semibold tracking-wide text-gray-100">{userName.toUpperCase()}</p>
              </div>
              <div className="flex space-x-6 items-end">
                <div className="text-left">
                  <p className="text-[8px] text-gray-500">EXP</p>
                  <p className="text-xs font-semibold text-gray-200 font-mono">{expiry}</p>
                </div>
                <div className="text-left">
                  <p className="text-[8px] text-gray-500">CVV</p>
                  <p className="text-xs font-semibold text-gray-200 font-mono">{cvv}</p>
                </div>
                {/* Visual mastercard-like circle icons */}
                <div className="flex -space-x-2 opacity-80 shrink-0">
                  <div className="w-6 h-6 rounded-full bg-rose-500" />
                  <div className="w-6 h-6 rounded-full bg-amber-500/80" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Info className="w-5 h-5 text-emerald-400" />
                <span>Card Details</span>
              </h3>
              
              <div className="divide-y divide-gray-800 text-sm space-y-3 pt-1">
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400">Platform ID</span>
                  <span className="font-mono text-emerald-400 font-medium">{card.cardId}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400">Activated On</span>
                  <span className="text-gray-200">{new Date(card.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400">Cashback Reward</span>
                  <span className="text-emerald-400 font-semibold">2.5% on all transactions</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400">Daily ATM Limit</span>
                  <span className="text-gray-200">$5,000.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Case 4: No card exists, display the request form
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Crypto Card</h1>
        <p className="text-gray-400">
          Activate your platform-issued Crypto Card to spend your assets anywhere.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Platform Card ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    placeholder="e.g. CARD-84X9-22B"
                    className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter the unique Card ID provided by the platform. Do not enter personal credit card numbers.
                </p>
              </div>

              {status === 'error' && (
                <p className="text-rose-500 text-sm font-medium">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={!cardId || status === 'activating'}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(45,157,104,0.2)] hover:shadow-[0_0_30px_rgba(45,157,104,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {status === 'activating' ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Request Activation'
                )}
              </button>
            </form>
          </div>

          <div className="flex flex-col justify-center space-y-6">
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Secure Activation</h3>
              <p className="text-sm text-gray-400">
                Your virtual Crypto Card acts as a bridge to your digital portfolio. Activation requires profile verification and an administrator's manual approval for compliance and security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

