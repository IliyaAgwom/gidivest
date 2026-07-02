'use client';

import { useState, useEffect } from 'react';
import { Check, X, Search, Image as ImageIcon, Loader2 } from 'lucide-react';

interface VerificationRequest {
  id: string;
  user: string;
  email: string;
  photoUrl: string;
  date: string;
  status: string;
}

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchVerifications = async () => {
    try {
      const res = await fetch('/api/admin/verify');
      if (res.ok) {
        const data = await res.json();
        setVerifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: 'approve' }),
      });
      if (res.ok) {
        setVerifications(prev => prev.filter(v => v.id !== id));
        if (selectedPhoto) setSelectedPhoto(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: 'reject' }),
      });
      if (res.ok) {
        setVerifications(prev => prev.filter(v => v.id !== id));
        if (selectedPhoto) setSelectedPhoto(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredVerifications = verifications.filter(v => 
    v.user.toLowerCase().includes(search.toLowerCase()) ||
    v.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-gray-400 text-sm">Loading pending verifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pending Verifications</h1>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVerifications.length === 0 ? (
          <div className="col-span-full p-12 text-center text-gray-500 glass-card rounded-xl">
            No pending verifications found.
          </div>
        ) : (
          filteredVerifications.map((v) => (
            <div key={v.id} className="glass-card rounded-xl overflow-hidden flex flex-col hover:border-gray-700 transition-colors">
              <div className="h-48 bg-gray-950 relative group flex items-center justify-center cursor-pointer" onClick={() => setSelectedPhoto(v.photoUrl)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.photoUrl} alt="Verification" className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-300" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="flex items-center space-x-2 bg-gray-900/80 px-4 py-2 rounded-full text-sm hover:bg-gray-900 transition-colors">
                    <ImageIcon className="w-4 h-4" />
                    <span>View Full Size</span>
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-semibold text-lg text-white">{v.user}</h3>
                <p className="text-sm text-gray-400 mb-4">{v.email}</p>
                <div className="text-xs text-gray-500 mb-6">Submitted: {v.date}</div>
                
                <div className="mt-auto grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleReject(v.id)}
                    className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleApprove(v.id)}
                    className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image zoom modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-3xl max-h-[80vh] overflow-hidden rounded-2xl border border-gray-800 bg-gray-900" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedPhoto(null)} 
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedPhoto} alt="Verification Zoomed" className="max-w-full max-h-[85vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

