'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Image as ImageIcon, File } from 'lucide-react';

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  fileType: 'image' | 'pdf' | 'other';
}

export default function FileViewerModal({ isOpen, onClose, fileUrl, fileName, fileType }: FileViewerModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-gradient-to-b from-slate-900 to-black rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  {fileType === 'image' ? (
                    <ImageIcon className="w-5 h-5 text-rose-400" />
                  ) : fileType === 'pdf' ? (
                    <FileText className="w-5 h-5 text-rose-400" />
                  ) : (
                    <File className="w-5 h-5 text-rose-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-semibold truncate max-w-md">{fileName}</h3>
                  <p className="text-slate-400 text-xs uppercase tracking-wider">
                    {fileType === 'image' ? 'Image Preview' : fileType === 'pdf' ? 'PDF Document' : 'File'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Body - Display Base64 content */}
            <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              {fileType === 'image' ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                  <img 
                    src={fileUrl} 
                    alt={fileName}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  />
                </div>
                 ) : fileType === 'pdf' ? (
                  <div className="w-full h-full flex flex-col">
                    <div className="p-4 border-b border-white/10 bg-slate-900/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                            <FileText className="w-5 h-5 text-rose-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold truncate max-w-md">{fileName}</h3>
                            <p className="text-slate-400 text-xs uppercase tracking-wider">PDF Document</p>
                          </div>
                        </div>
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-gradient-to-r from-rose-600 to-crimson-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-rose-900/30 transition-all flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </a>
                      </div>
                    </div>
                    <div className="flex-1 p-4">
                      <iframe
                        src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                        className="w-full h-full rounded-lg border border-white/10"
                        title="PDF Document"
                        style={{ background: '#1a1a1a' }}
                      />
                    </div>
                  </div>
                ) : (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <File className="w-20 h-20 text-slate-400 mb-4" />
                  <p className="text-slate-300">{fileName}</p>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-rose-600 to-crimson-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-rose-900/30 transition-all"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
