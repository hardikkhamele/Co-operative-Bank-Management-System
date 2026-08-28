import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Check, X, AlertCircle, SwitchCamera, Loader2 } from 'lucide-react';

/**
 * CameraCaptureModal Component
 * Provides in-app live webcam / camera stream with snapshot capture,
 * device switcher (front/rear), preview, and retake controls.
 *
 * @param {boolean} isOpen - Controls visibility of the modal
 * @param {Function} onClose - Callback when modal is closed
 * @param {Function} onCapture - Callback receiving the captured File (image/jpeg)
 */
const CameraCaptureModal = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' for rear, 'user' for selfie
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  // Stop camera tracks helper
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Start camera stream
  const startCamera = async () => {
    stopStream();
    setLoading(true);
    setError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser. Please use file upload instead.');
      }

      const constraints = {
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { facingMode: { ideal: facingMode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch((err) => {
          console.warn('Video play error:', err);
        });
      }

      // Enumerate available video input devices
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoDevices);
    } catch (err) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera device found on this system.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is currently in use by another application.');
      } else {
        setError(err.message || 'Unable to access camera.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Effect to start/stop stream based on isOpen state
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera();
    } else {
      stopStream();
      setCapturedImage(null);
      setError(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, selectedDeviceId, facingMode]);

  // Flip camera (between environment and user)
  const toggleFacingMode = () => {
    setSelectedDeviceId('');
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture current frame from video to canvas
  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopStream();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Confirm photo and convert to File
  const handleConfirm = () => {
    if (!capturedImage) return;

    try {
      const arr = capturedImage.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const filename = `receipt_snap_${Date.now()}.jpg`;
      const file = new File([blob], filename, { type: 'image/jpeg' });

      onCapture(file);
      onClose();
    } catch (e) {
      console.error('Error generating image file:', e);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#225091] flex items-center justify-center">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Capture Receipt Photo</h3>
              <p className="text-[11px] text-gray-500">Hold receipt clearly in front of the camera</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Camera / Preview Viewport */}
        <div className="relative bg-black flex-1 min-h-[300px] max-h-[460px] flex items-center justify-center overflow-hidden">
          {/* Loading Indicator */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950 text-white z-10">
              <Loader2 size={32} className="animate-spin text-blue-400" />
              <p className="text-xs font-medium text-gray-300">Starting camera stream...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-white z-10">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                <AlertCircle size={24} />
              </div>
              <p className="text-sm font-semibold text-rose-300 mb-1">Camera Access Issue</p>
              <p className="text-xs text-gray-400 max-w-xs mb-4">{error}</p>
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <RefreshCw size={14} /> Try Again
              </button>
            </div>
          )}

          {/* Live Video Stream */}
          {!capturedImage && (
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured receipt preview"
              className="w-full h-full object-contain bg-black"
            />
          )}

          {/* Hidden Canvas for snapshot */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Live Guide Overlay */}
          {!capturedImage && !error && !loading && (
            <div className="absolute inset-4 border-2 border-dashed border-white/40 rounded-xl pointer-events-none flex flex-col justify-between p-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 bg-black/40 px-2 py-0.5 rounded-sm self-start">
                Align Receipt Within Box
              </span>
            </div>
          )}

          {/* Flip / Switch Camera Button (Visible when multi-camera available) */}
          {!capturedImage && !error && !loading && (
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              {devices.length > 1 && (
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="bg-black/60 text-white text-[11px] font-medium rounded-lg px-2.5 py-1.5 border border-white/20 backdrop-blur-xs outline-none cursor-pointer max-w-[130px] truncate"
                >
                  {devices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId} className="bg-slate-900 text-white">
                      {d.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={toggleFacingMode}
                title="Switch Camera (Front/Back)"
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 backdrop-blur-xs transition-colors"
              >
                <SwitchCamera size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between gap-3">
          {!capturedImage ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading || !!error}
                onClick={handleSnap}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#225091] hover:bg-[#1b427b] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Camera size={16} />
                <span>Capture Photo</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Retake Photo</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Check size={16} />
                <span>Use This Photo</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCaptureModal;
