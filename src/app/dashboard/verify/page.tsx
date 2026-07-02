'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, CheckCircle, Clock, XCircle, RefreshCw, ZoomIn } from 'lucide-react';

type DbStatus = 'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function VerifyPage() {
  /* ── DB status ── */
  const [dbStatus, setDbStatus]   = useState<DbStatus>('UNVERIFIED');
  const [dbPhotoUrl, setDbPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);

  /* ── Camera state ── */
  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);

  const [cameraOn,    setCameraOn]    = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [snapshot,    setSnapshot]    = useState<string | null>(null); // base64 data-url
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState('');

  /* ── Fetch current status ── */
  const fetchStatus = useCallback(async () => {
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
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  /* ── Start camera ── */
  const startCamera = useCallback(async () => {
    setCameraError('');
    setSnapshot(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch (err: any) {
      setCameraError(
        err?.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings.'
          : 'Could not access camera. Make sure no other app is using it.'
      );
    }
  }, []);

  /* ── Stop camera ── */
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  /* ── Take snapshot ── */
  const takeSnapshot = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // mirror horizontally so it feels like a selfie
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Store data URL for preview only — actual upload uses canvas.toBlob()
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setSnapshot(dataUrl);
    stopCamera();
  }, [stopCamera]);

  /* ── Retake ── */
  const retake = useCallback(() => {
    setSnapshot(null);
    setUploadError('');
    startCamera();
  }, [startCamera]);

  /* ── Submit snapshot ── */
  const handleSubmit = useCallback(async () => {
    if (!snapshot || !canvasRef.current) return;
    setUploading(true);
    setUploadError('');

    try {
      // Get blob directly from canvas (most reliable cross-browser method)
      const blob: Blob = await new Promise((resolve, reject) => {
        canvasRef.current!.toBlob(
          (b) => { if (b) resolve(b); else reject(new Error('Canvas toBlob() returned null')); },
          'image/jpeg',
          0.92
        );
      });

      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });

      // Upload to Cloudinary (preset must be set to "Unsigned" in Cloudinary dashboard)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'hughvest');
      formData.append('folder', 'verifications');

      const cloudRes = await fetch(
        'https://api.cloudinary.com/v1_1/dw2oepskw/image/upload',
        { method: 'POST', body: formData }
      );

      // Parse response regardless of status to get error details
      const cloudData = await cloudRes.json();

      if (!cloudRes.ok) {
        // Show the actual Cloudinary error message
        const errMsg = cloudData?.error?.message || `Cloudinary error (${cloudRes.status})`;
        throw new Error(`Upload failed: ${errMsg}`);
      }

      const photoUrl = cloudData.secure_url as string;
      if (!photoUrl) throw new Error('No URL returned from Cloudinary');

      // Save to our API
      const apiRes = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl }),
      });

      if (!apiRes.ok) {
        const d = await apiRes.json();
        throw new Error(d.error || 'Submission failed');
      }

      stopCamera();
      setDbStatus('PENDING');
      setDbPhotoUrl(photoUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [snapshot, stopCamera]);

  /* ─────────────────── RENDER ─────────────────── */

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading verification status...</p>
      </div>
    );
  }

  /* ── APPROVED ── */
  if (dbStatus === 'APPROVED') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Profile Verification</h1>
          <p className="text-gray-400">Your identity has been verified successfully.</p>
        </div>
        <div className="glass-card rounded-2xl p-8 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Profile Verified ✅</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Congratulations! Your identity has been confirmed. You now have full access to all platform features including the Crypto Card.
            </p>
          </div>
          {dbPhotoUrl && (
            <div className="mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/50 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dbPhotoUrl} alt="Verified selfie" className="w-full h-full object-cover" />
            </div>
          )}
          <span className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
            <span>✓ Verification ID: Verified User</span>
          </span>
        </div>
      </div>
    );
  }

  /* ── PENDING ── */
  if (dbStatus === 'PENDING') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Profile Verification</h1>
          <p className="text-gray-400">Your selfie is under review.</p>
        </div>
        <div className="glass-card rounded-2xl p-8 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 text-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Under Review</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Your live selfie is currently being reviewed by our compliance team. This usually takes 24–48 hours.
            </p>
          </div>
          {dbPhotoUrl && (
            <div className="mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-amber-500/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dbPhotoUrl} alt="Pending selfie" className="w-full h-full object-cover opacity-80" />
            </div>
          )}
          <span className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Status: Pending Review</span>
          </span>
        </div>
      </div>
    );
  }

  /* ── UNVERIFIED / REJECTED → show camera capture ── */
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile Verification</h1>
        <p className="text-gray-400">
          Take a live selfie to verify your identity and unlock all platform features.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6 relative z-10">

          {/* Rejected banner */}
          {dbStatus === 'REJECTED' && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm flex items-start space-x-3">
              <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-300">Verification Rejected</p>
                <p className="mt-1">
                  Your previous selfie was rejected. Please ensure your face is clear, well-lit, and fully visible. Take a new live selfie below.
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/10 text-blue-300 p-4 rounded-xl text-sm flex items-start space-x-3">
            <span className="text-blue-400 text-base">ℹ️</span>
            <ul className="space-y-1 list-disc list-inside">
              <li>Click <strong>Open Camera</strong> to start your front camera</li>
              <li>Look directly at the camera in a well-lit area</li>
              <li>Click <strong>Take Selfie</strong> to capture your photo</li>
              <li>Review the preview and <strong>Submit</strong> — or retake if needed</li>
            </ul>
          </div>

          {/* ── Camera / Preview area ── */}
          <div className="relative w-full aspect-video max-h-80 bg-gray-900/80 rounded-2xl overflow-hidden border-2 border-dashed border-gray-700 flex items-center justify-center">
            {/* Live video feed */}
            <video
              ref={videoRef}
              className={`w-full h-full object-cover scale-x-[-1] ${cameraOn && !snapshot ? 'block' : 'hidden'}`}
              playsInline
              muted
            />

            {/* Snapshot preview */}
            {snapshot && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={snapshot}
                  alt="Your selfie preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <ZoomIn className="w-3 h-3" /> Preview
                </div>
              </>
            )}

            {/* Idle / no camera */}
            {!cameraOn && !snapshot && (
              <div className="flex flex-col items-center justify-center space-y-3 text-gray-500 p-8">
                <Camera className="w-14 h-14 text-gray-600" />
                <p className="text-sm text-center">Your camera feed will appear here.<br />Click <strong className="text-emerald-400">Open Camera</strong> to begin.</p>
              </div>
            )}

            {/* Camera face guide overlay */}
            {cameraOn && !snapshot && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-44 h-56 rounded-full border-2 border-emerald-400/50 border-dashed opacity-60" />
              </div>
            )}
          </div>

          {/* Hidden canvas for snapshot */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera error */}
          {cameraError && (
            <p className="text-rose-400 text-sm font-medium text-center flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" /> {cameraError}
            </p>
          )}

          {/* Upload error */}
          {uploadError && (
            <p className="text-rose-400 text-sm font-medium text-center flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" /> {uploadError}
            </p>
          )}

          {/* ── Action buttons ── */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!cameraOn && !snapshot && (
              <button
                onClick={startCamera}
                className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Open Camera
              </button>
            )}

            {cameraOn && !snapshot && (
              <button
                onClick={takeSnapshot}
                className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 animate-pulse"
              >
                <Camera className="w-5 h-5" />
                Take Selfie
              </button>
            )}

            {snapshot && (
              <>
                <button
                  onClick={retake}
                  disabled={uploading}
                  className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className="w-5 h-5" />
                  Retake
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {uploading ? 'Submitting…' : 'Submit Selfie'}
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
