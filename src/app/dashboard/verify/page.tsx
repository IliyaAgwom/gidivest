'use client';

import { useState, useEffect } from 'react';
import { Camera, CheckCircle, Clock, Upload, XCircle } from 'lucide-react';

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  
  const [dbStatus, setDbStatus] = useState<'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED'>('UNVERIFIED');
  const [dbPhotoUrl, setDbPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/verify');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data.status);
        setDbPhotoUrl(data.photoUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus('uploading');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'hughvest');
      
      const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/dw2oepskw/image/upload', {
        method: 'POST',
        body: formData,
      });

      if (!cloudinaryRes.ok) {
        setStatus('error');
        return;
      }

      const cloudinaryData = await cloudinaryRes.json();
      const photoUrl = cloudinaryData.secure_url;

      if (!photoUrl) {
        setStatus('error');
        return;
      }

      const res = await fetch('/api/verify', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl }) 
      });

      if (res.ok) {
        setDbStatus('PENDING');
        setDbPhotoUrl(photoUrl);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading verification status...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile Verification</h1>
        <p className="text-gray-400">
          Verify your profile to unlock full platform features, secure your withdrawals, and request Crypto Cards.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {dbStatus === 'APPROVED' ? (
          <div className="text-center py-12 space-y-6 relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-500 mb-4 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">Profile Verified</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Congratulations! Your identity has been successfully verified. You have full access to all features on the platform.
              </p>
            </div>
            {dbPhotoUrl && (
              <div className="mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/50 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dbPhotoUrl} alt="Verified User" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="pt-4">
              <span className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
                <span>Verification ID: Verified User</span>
              </span>
            </div>
          </div>
        ) : dbStatus === 'PENDING' || status === 'success' ? (
          <div className="text-center py-12 space-y-6 relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 text-amber-500 mb-4 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">Under Review</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Your selfie is currently under review by our safety and compliance team. This process usually takes 24-48 hours.
              </p>
            </div>
            {dbPhotoUrl && (
              <div className="mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-amber-500/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dbPhotoUrl} alt="Pending Selfie" className="w-full h-full object-cover opacity-80" />
              </div>
            )}
            <div className="pt-4">
              <span className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Status: Pending Review</span>
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {dbStatus === 'REJECTED' && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-300">Verification Rejected</p>
                  <p className="mt-1">
                    Your previous selfie submission was rejected because it did not meet our quality standards. Please ensure the selfie is clear, well-lit, and your entire face is visible.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300">Upload Photo (Selfie)</label>
              
              <div className="relative group">
                <label className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-900/40 hover:bg-gray-900/70 hover:border-emerald-500/50 transition-all overflow-hidden relative">
                  {preview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <Upload className="w-8 h-8 text-white mb-2" />
                        <span className="text-sm font-medium text-white">Change Photo</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-14 h-14 text-gray-500 mb-4 group-hover:text-emerald-400 transition-colors" />
                      <p className="mb-2 text-sm text-gray-300">
                        <span className="font-semibold text-emerald-400">Click to upload selfie</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            <div className="bg-blue-500/10 text-blue-300 p-4 rounded-xl text-sm flex items-start space-x-3 border border-blue-500/10">
              <span className="text-blue-400">ℹ️</span>
              <p>
                Please ensure your face is clearly visible, well-lit, and not obstructed by sunglasses, masks, or hats. Do not upload photos of government ID documents.
              </p>
            </div>

            {status === 'error' && (
              <p className="text-rose-500 text-sm font-medium text-center">
                An error occurred while uploading. Please check your network and try again.
              </p>
            )}

            <button
              type="submit"
              disabled={!file || status === 'uploading'}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {status === 'uploading' ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Submit for Verification'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

