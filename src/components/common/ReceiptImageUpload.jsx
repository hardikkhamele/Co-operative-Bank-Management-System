import React, { useState, useRef } from 'react';
import { Upload, Camera, FileText, X, Image as ImageIcon, Eye } from 'lucide-react';
import CameraCaptureModal from './CameraCaptureModal';

/**
 * ReceiptImageUpload Component
 * Provides both "Upload File" and "Capture from Camera" options with instant preview.
 *
 * @param {File|null} file - Currently selected file
 * @param {Function} onChange - Callback when file changes: (file) => void
 * @param {string|null} existingImageUrl - Optional existing image URL (e.g. for Edit modal)
 * @param {string} label - Optional label (default: "Receipt Document / Voucher Image")
 */
const ReceiptImageUpload = ({
  file,
  onChange,
  existingImageUrl = null,
  label = 'Receipt Document / Voucher Image',
}) => {
  const fileInputRef = useRef(null);
  const mobileCameraInputRef = useRef(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Generate object URL for local file preview
  React.useEffect(() => {
    if (file && file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  const handleCameraCapture = (capturedFile) => {
    onChange(capturedFile);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (mobileCameraInputRef.current) mobileCameraInputRef.current.value = '';
  };

  const displayPreview = previewUrl || existingImageUrl;
  const isPdf = file && file.type === 'application/pdf';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* When File or Image is Present: Show Preview Card */}
      {displayPreview || file ? (
        <div className="relative rounded-2xl border border-gray-200 bg-slate-50/70 p-3 flex items-center gap-3.5 shadow-2xs group hover:border-[#225091]/30 transition-all">
          <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-2xs">
            {isPdf ? (
              <FileText size={26} className="text-rose-500" />
            ) : displayPreview ? (
              <img
                src={displayPreview}
                alt="Receipt Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon size={26} className="text-gray-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">
              {file?.name || (existingImageUrl ? 'Current Receipt Voucher' : 'Attached Document')}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {file?.size
                ? `${(file.size / 1024).toFixed(1)} KB`
                : existingImageUrl
                ? 'Uploaded Image'
                : 'Ready for upload'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-semibold text-[#225091] hover:underline cursor-pointer"
              >
                Change File
              </button>
              <span className="text-gray-300">•</span>
              <button
                type="button"
                onClick={() => setIsCameraModalOpen(true)}
                className="text-[11px] font-semibold text-[#225091] hover:underline cursor-pointer"
              >
                Retake with Camera
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="w-7 h-7 rounded-full bg-gray-200/70 hover:bg-rose-100 hover:text-rose-600 text-gray-600 flex items-center justify-center transition-colors cursor-pointer mr-1"
            title="Remove document"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        /* Empty State: Dual Option Selection (Upload File OR Capture from Camera) */
        <div className="rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#225091]/40 bg-gray-50/50 hover:bg-blue-50/20 p-4 transition-all flex flex-col items-center justify-center text-center">
          <p className="text-xs font-semibold text-gray-700 mb-1">
            Attach Receipt Document or Photo
          </p>
          <p className="text-[11px] text-gray-400 mb-3.5">
            Supported formats: PNG, JPG, JPEG, WEBP or PDF (Max 10MB)
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 w-full max-w-sm">
            {/* Option 1: Browse / Upload File */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:border-[#225091] text-gray-700 hover:text-[#225091] text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
            >
              <Upload size={14} className="text-[#225091]" />
              <span>Upload File</span>
            </button>

            {/* Option 2: Live Camera / Webcam Capture */}
            <button
              type="button"
              onClick={() => setIsCameraModalOpen(true)}
              className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#225091] hover:bg-[#1b427b] text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
            >
              <Camera size={14} />
              <span>Capture Photo</span>
            </button>
          </div>
        </div>
      )}

      {/* Live Camera Viewfinder Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};

export default ReceiptImageUpload;
