'use client';

import { useState, useEffect } from 'react';
import { Check, X, Search, CreditCard, Loader2, ShieldOff } from 'lucide-react';

interface CardActivationRequest {
  id: string;
  user: string;
  email: string;
  cardId: string;
  date: string;
  status: string;
}

export default function AdminCardsPage() {
  const [cards, setCards] = useState<CardActivationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');

  const fetchCards = async () => {
    try {
      const res = await fetch('/api/admin/card');
      if (res.ok) {
        const data = await res.json();
        setCards(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleApprove = async (id: string, cId: string) => {
    try {
      const res = await fetch('/api/admin/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: cId, action: 'approve' }),
      });
      if (res.ok) {
        const data = await res.json();
        setCards(prev => prev.map(c => c.id === id ? { ...c, status: data.status } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string, cId: string) => {
    try {
      const res = await fetch('/api/admin/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: cId, action: 'reject' }),
      });
      if (res.ok) {
        const data = await res.json();
        setCards(prev => prev.map(c => c.id === id ? { ...c, status: data.status } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestrict = async (id: string, cId: string) => {
    try {
      const res = await fetch('/api/admin/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: cId, action: 'restrict' }),
      });
      if (res.ok) {
        const data = await res.json();
        setCards(prev => prev.map(c => c.id === id ? { ...c, status: data.status } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnrestrict = async (id: string, cId: string) => {
    try {
      const res = await fetch('/api/admin/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: cId, action: 'unrestrict' }),
      });
      if (res.ok) {
        const data = await res.json();
        setCards(prev => prev.map(c => c.id === id ? { ...c, status: data.status } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCards = cards.filter(c => 
    (activeTab === 'pending' ? c.status === 'PENDING' : c.status !== 'PENDING') &&
    (
      c.user.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.cardId.toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-gray-400 text-sm">Loading pending card activations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage User Cards</h1>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="flex space-x-2 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Pending Requests
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'active'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Approved & Restricted
        </button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="py-4 px-6 font-semibold text-sm text-gray-400">User</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-400">Card ID</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-400">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-400">Requested On</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 bg-gray-900/10">
                    No {activeTab === 'pending' ? 'pending' : 'approved or restricted'} cards found.
                  </td>
                </tr>
              ) : (
                filteredCards.map((c) => (
                  <tr key={c.id} className="border-b border-gray-800/40 hover:bg-gray-850/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{c.user}</div>
                      <div className="text-sm text-gray-400">{c.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                        <span className="font-mono text-sm bg-gray-950 px-2.5 py-1 rounded border border-gray-800 text-gray-200">{c.cardId}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {c.status === 'PENDING' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Pending</span>
                      )}
                      {c.status === 'ACTIVE' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                      )}
                      {c.status === 'RESTRICTED' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Restricted</span>
                      )}
                      {c.status === 'INACTIVE' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">Inactive</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-400">{c.date}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        {c.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleReject(c.id, c.cardId)}
                              className="p-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                              title="Reject"
                            >
                              <X className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRestrict(c.id, c.cardId)}
                              className="p-2 rounded-lg text-gray-400 hover:bg-amber-500/10 hover:text-amber-400 transition-colors"
                              title="Restrict"
                            >
                              <ShieldOff className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleApprove(c.id, c.cardId)}
                              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                              title="Approve"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {c.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleRestrict(c.id, c.cardId)}
                            className="p-2 rounded-lg text-gray-400 hover:bg-amber-500/10 hover:text-amber-400 transition-colors"
                            title="Restrict"
                          >
                            <ShieldOff className="w-5 h-5" />
                          </button>
                        )}
                        {c.status === 'RESTRICTED' && (
                          <button
                            onClick={() => handleUnrestrict(c.id, c.cardId)}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                            title="Unrestrict & Activate"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

