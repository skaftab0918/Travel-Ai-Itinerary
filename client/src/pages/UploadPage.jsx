import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import { uploadFiles } from "../services/api";

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function UploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      const reasons = rejected[0].errors.map((e) => e.message).join(", ");
      toast.error(`File rejected: ${reasons}`);
    }
    const total = files.length + accepted.length;
    if (total > MAX_FILES) {
      toast.error(`Max ${MAX_FILES} files allowed`);
      return;
    }
    setFiles((prev) => [...prev, ...accepted.map((f) => Object.assign(f, {
      preview: URL.createObjectURL(f),
    }))]);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
      "application/pdf": [".pdf"],
    },
    maxSize: MAX_SIZE,
    multiple: true,
  });

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      return toast.error("Please add at least one document");
    }
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      const res = await uploadFiles(formData, setProgress);
      const { itineraryId } = res.data;
      toast.success("Documents uploaded! Generating your itinerary...");
      navigate(`/itinerary/${itineraryId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
      setUploading(false);
    }
  };

  const getFileIcon = (file) => {
    if (file.type === "application/pdf") return "📄";
    return "🖼️";
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="starfield" />
      <Navbar />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-28 pb-16">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="font-display text-3xl sm:text-4xl text-white mb-3">
            Upload your travel documents
          </h1>
          <p className="text-night-400 text-sm">
            Flight tickets, hotel bookings, rail passes — PDF or image, up to {MAX_FILES} files
          </p>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`relative rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 animate-slide-up ${
            isDragActive
              ? "border-2 border-amber-400 bg-amber-500/5"
              : "border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/2"
          }`}
          style={{ background: isDragActive ? "rgba(245,158,11,0.04)" : "rgba(16,42,67,0.4)" }}
        >
          <input {...getInputProps()} />

          {/* Animated icon */}
          <div className={`text-5xl mb-4 transition-transform duration-300 ${isDragActive ? "scale-110" : ""}`}>
            {isDragActive ? "⬇️" : "📁"}
          </div>

          <p className="text-white font-medium mb-1">
            {isDragActive ? "Drop files here" : "Drag & drop your documents"}
          </p>
          <p className="text-night-400 text-sm mb-5">
            or click to browse
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-night-500">
            <span className="flex items-center gap-1">📄 PDF</span>
            <span className="w-1 h-1 rounded-full bg-night-600" />
            <span className="flex items-center gap-1">🖼️ JPG / PNG / WebP</span>
            <span className="w-1 h-1 rounded-full bg-night-600" />
            <span>Max 10MB each</span>
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-6 space-y-3 animate-slide-up">
            <p className="text-xs text-night-400 font-medium uppercase tracking-wider">
              {files.length} file{files.length > 1 ? "s" : ""} selected
            </p>
            {files.map((file, idx) => (
              <div key={idx} className="glass-light rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-xl">{getFileIcon(file)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-night-500">{formatSize(file.size)}</p>
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  className="text-night-500 hover:text-coral-400 transition-colors text-lg leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload progress */}
        {uploading && (
          <div className="mt-6 glass rounded-xl p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-night-300">Uploading & processing…</span>
              <span className="text-amber-400 font-medium">{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #f59e0b, #f43f5e)",
                }}
              />
            </div>
            <p className="text-xs text-night-500 mt-2">
              AI is reading your documents — this may take 20–40 seconds
            </p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className="btn-primary w-full mt-6 py-4 text-base"
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating itinerary…
            </span>
          ) : (
            `Generate itinerary ${files.length > 0 ? `(${files.length} file${files.length > 1 ? "s" : ""})` : ""} →`
          )}
        </button>

        {/* Tips */}
        <div className="mt-8 glass rounded-xl p-5">
          <p className="text-xs font-medium text-night-300 mb-3 uppercase tracking-wider">For best results</p>
          <ul className="space-y-2 text-xs text-night-400">
            {[
              "Upload clear, unblurred photos or original PDFs",
              "Include both outbound and return tickets if available",
              "Hotel booking confirmations give the most detail",
              "Multiple documents together create a richer itinerary",
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
