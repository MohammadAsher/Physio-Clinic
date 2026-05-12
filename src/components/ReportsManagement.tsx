'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Image, File, X, Trash2, Eye, EyeOff,
  Check, AlertCircle, FileUp, Plus, Loader2
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, arrayRemove, onSnapshot } from 'firebase/firestore';
import FileViewerModal from './FileViewerModal';

interface ReportItem {
  id: string;
  fileName: string;
  reportName: string;
  fileUrl: string;
  fileType: 'image' | 'pdf' | 'other';
  uploadedAt: any;
  showToDoctor: boolean;
}

interface ReportsManagementProps {
  user: any;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function ReportsManagement({ user }: ReportsManagementProps) {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [reportName, setReportName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedReport, setSelectedReport] = useState<{
    fileUrl: string; fileName: string; fileType: 'image' | 'pdf' | 'other'
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time sync of reports from Firestore
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const fetchedReports: ReportItem[] = (data?.reports || []).map((r: any, idx: number) => ({
          id: r.id || `report-${idx}-${Date.now()}`,
          fileName: r.fileName || 'Untitled Report',
          reportName: r.reportName || r.fileName || 'Untitled Report',
          fileUrl: r.fileUrl || '',
          fileType: r.fileType || 'other',
          uploadedAt: r.uploadedAt || new Date(),
          showToDoctor: r.showToDoctor ?? false,
        }));
        setReports(fetchedReports);
      }
    });

    return () => unsubscribe();
  }, [user?.id]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const validateFile = (file: File): string | null => {
    const ext = file.name.toLowerCase().split('.').pop();
    const validExts = ['pdf', 'jpg', 'jpeg', 'png'];
    if (!validExts.includes(ext || '')) {
      return 'Only PDF, JPG, and PNG files are supported.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB.';
    }
    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }

    setSelectedFile(file);
    if (!reportName.trim()) {
      setReportName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !user?.id) return;

    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }

    setSelectedFile(file);
    if (!reportName.trim()) {
      setReportName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUpload = async () => {
    if (!user?.id || !selectedFile) return;

    const error = validateFile(selectedFile);
    if (error) {
      alert(error);
      return;
    }

    if (!reportName.trim()) {
      alert('Please enter a report name.');
      return;
    }

    setUploading(true);
    try {
      const base64 = await fileToBase64(selectedFile);
      const fileType = selectedFile.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image';

      const newReport: ReportItem = {
        id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fileName: selectedFile.name,
        reportName: reportName.trim(),
        fileUrl: base64,
        fileType,
        uploadedAt: new Date(),
        showToDoctor: false,
      };

      const updatedReports = [...reports, newReport];

      await updateDoc(doc(db, 'users', user.id), {
        reports: updatedReports.map(r => ({
          id: r.id,
          fileName: r.fileName,
          reportName: r.reportName,
          fileUrl: r.fileUrl,
          fileType: r.fileType,
          uploadedAt: r.uploadedAt,
          showToDoctor: r.showToDoctor,
        })),
      });

      // Reset form
      setReportName('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Error uploading report:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!user?.id) return;

    try {
      setDeletingId(reportId);
      const updatedReports = reports.filter(r => r.id !== reportId);
      await updateDoc(doc(db, 'users', user.id), {
        reports: updatedReports.map(r => ({
          id: r.id,
          fileName: r.fileName,
          reportName: r.reportName,
          fileUrl: r.fileUrl,
          fileType: r.fileType,
          uploadedAt: r.uploadedAt,
          showToDoctor: r.showToDoctor,
        })),
      });
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleShareWithDoctor = async (reportId: string) => {
    if (!user?.id) return;

    try {
      const updatedReports = reports.map(r =>
        r.id === reportId ? { ...r, showToDoctor: !r.showToDoctor } : r
      );
      await updateDoc(doc(db, 'users', user.id), {
        reports: updatedReports.map(r => ({
          id: r.id,
          fileName: r.fileName,
          reportName: r.reportName,
          fileUrl: r.fileUrl,
          fileType: r.fileType,
          uploadedAt: r.uploadedAt,
          showToDoctor: r.showToDoctor,
        })),
      });
    } catch (err) {
      console.error('Error toggling visibility:', err);
      alert('Failed to update visibility. Please try again.');
    }
  };

  const handleNameChange = async (reportId: string, newName: string) => {
    if (!user?.id) return;

    try {
      const updatedReports = reports.map(r =>
        r.id === reportId ? { ...r, reportName: newName } : r
      );
      await updateDoc(doc(db, 'users', user.id), {
        reports: updatedReports.map(r => ({
          id: r.id,
          fileName: r.fileName,
          reportName: newName,
          fileUrl: r.fileUrl,
          fileType: r.fileType,
          uploadedAt: r.uploadedAt,
          showToDoctor: r.showToDoctor,
        })),
      });
    } catch (err) {
      console.error('Error updating report name:', err);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <Image className="w-5 h-5 text-emerald-400" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-400" />;
      default:
        return <File className="w-5 h-5 text-sky-400" />;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const formatFileSize = (base64: string) => {
    const size = Math.round((base64.length * 3) / 4 / 1024);
    return size < 1024 ? `${size} KB` : `${(size / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-8">
      {/* Medical Reports Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-white/20 hover:shadow-crimson-glow transition-all duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-600 to-crimson-700 flex items-center justify-center shadow-lg shadow-rose-900/30">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Medical Reports</h3>
              <p className="text-rose-400 text-xs">Manage your medical documents</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-400">
            <Eye className="w-3 h-3" />
            <span>{reports.filter(r => r.showToDoctor).length} shared with doctor</span>
          </div>
        </div>

        {/* Upload Form */}
        <div className="space-y-4">
          {/* Report Name Input */}
          <div>
            <label className="text-slate-400 text-sm mb-2 block">Report Name</label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="e.g. Blood Test"
              className="glass-input w-full"
            />
          </div>

          {/* File Input */}
          <div>
            <label className="text-slate-400 text-sm mb-2 block">File (PDF, JPG, PNG - max 10MB)</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-emerald-400 bg-emerald-500/10'
                  : 'border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <div className="text-center">
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                    <p className="text-emerald-300 font-medium text-sm">Uploading...</p>
                  </div>
                ) : selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <Check className="w-8 h-8 text-emerald-400" />
                    <p className="text-emerald-300 font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-slate-500 text-xs">Click to change file</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto mb-2 text-rose-400 group-hover:text-rose-300 transition-colors" />
                    <p className="text-slate-300 font-medium text-sm mb-1">Click to upload or drag and drop</p>
                    <p className="text-slate-500 text-xs">PDF, JPG, PNG (Max 10MB)</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Upload Button */}
          <motion.button
            onClick={handleUpload}
            disabled={uploading || !selectedFile || !reportName.trim()}
            className="w-full py-3 rounded-xl premium-gradient text-white font-semibold shadow-lg shadow-rose-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload Report</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-6" />

        {/* Reports List */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-rose-400" />
            All Reports ({reports.length})
          </h4>

          <AnimatePresence>
            {reports.length > 0 ? (
              <div className="space-y-2">
                {reports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                    className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-rose-500/30 hover:bg-white/10 transition-all duration-300 gap-2 sm:gap-4 relative"
                  >
                    {/* File Icon + Report Name */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 flex-shrink-0">
                        {getFileIcon(report.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={report.reportName}
                          onChange={(e) => handleNameChange(report.id, e.target.value)}
                          className="w-full bg-transparent text-white text-sm font-medium border-b border-transparent hover:border-white/20 focus:border-rose-500/40 focus:outline-none transition-colors pb-0.5 truncate"
                          placeholder="Untitled Report"
                          title="Click to rename"
                        />
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-[10px] text-slate-500">{report.fileName}</p>
                          <span className="text-[10px] text-slate-600">•</span>
                          <p className="text-[10px] text-slate-500">{formatDate(report.uploadedAt)}</p>
                          <span className="text-[10px] text-slate-600">•</span>
                          <p className="text-[10px] text-slate-500 hidden sm:inline">
                            {formatFileSize(report.fileUrl)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Share with Doctor Toggle */}
                      <button
                        onClick={() => toggleShareWithDoctor(report.id)}
                        className={`relative inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-300 ${
                          report.showToDoctor
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/5 text-slate-400 border border-white/10 hover:text-slate-200 hover:bg-white/10'
                        }`}
                        title={report.showToDoctor ? 'Hide from doctor' : 'Share with doctor'}
                      >
                        <div className="flex items-center gap-1.5">
                          {report.showToDoctor ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Shared</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Private</span>
                            </>
                          )}
                        </div>
                      </button>

                      {/* View Button */}
                      <button
                        onClick={() => setSelectedReport({
                          fileUrl: report.fileUrl,
                          fileName: report.fileName,
                          fileType: report.fileType === 'image' || report.fileType === 'pdf'
                            ? report.fileType
                            : 'other',
                        })}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-slate-400 hover:text-white transition-all"
                        title="View report"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setShowDeleteConfirm(report.id)}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-rose-500/20 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-all"
                        title="Delete report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Confirm Delete Popover */}
                      <AnimatePresence>
                        {showDeleteConfirm === report.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 5 }}
                            className="absolute top-full right-0 mt-2 w-64 z-20 glass-card p-4 border border-rose-500/30 shadow-2xl shadow-rose-900/20 rounded-xl"
                          >
                            <p className="text-sm text-white mb-2">
                              Delete <strong>"{report.reportName}"</strong>?
                            </p>
                            <p className="text-xs text-slate-400 mb-4">
                              This action cannot be undone.
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs hover:bg-white/10 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDeleteReport(report.id)}
                                className="flex-1 px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-500 transition-colors shadow-lg shadow-rose-900/20 flex items-center justify-center gap-1.5"
                              >
                                {deletingId === report.id ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  'Delete'
                                )}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 px-4"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-500/20 to-crimson-700/20 border border-rose-500/10 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-rose-400/60" />
                </div>
                <h3 className="text-xl font-bold text-gold mb-2">No Reports Yet</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Upload your medical reports, prescriptions, X-rays, or MRI scans.
                  <br />
                  Use the <span className="text-emerald-400 font-medium">Share with Doctor</span> toggle to control which reports your doctor can access.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* File Viewer Modal */}
      <FileViewerModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        fileUrl={selectedReport?.fileUrl || ''}
        fileName={selectedReport?.fileName || ''}
        fileType={selectedReport?.fileType || 'other'}
      />
    </div>
  );
}