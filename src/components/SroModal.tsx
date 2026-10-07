import React from 'react';
import { X, ShieldCheck, ExternalLink, Calendar } from 'lucide-react';
import manifestData from '../engine/tariffs-source-manifest.json';

interface SroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SroModal: React.FC<SroModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-100">
                Official NEPRA SRO Ground Truth
              </h3>
              <p className="text-xs text-neutral-400">
                Statutory Regulatory Orders published in the Gazette of Pakistan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300">
            <span className="font-semibold">Zero Guesswork Policy:</span> Every rate in this calculator is strictly backed by the Ministry of Energy (Power Division) and NEPRA determinations. No arbitrary assumptions or AI hallucinations.
          </div>

          <div className="space-y-3">
            {manifestData.sources.map((src) => (
              <div
                key={src.id}
                className="p-4 rounded-lg bg-neutral-800/60 border border-neutral-700/60 hover:border-neutral-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                        {src.sro_number}
                      </span>
                      <span className="text-xs text-neutral-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {src.gazette_date}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-neutral-200 mt-1.5">
                      {src.title}
                    </h4>
                  </div>
                  {src.nepra_url && (
                    <a
                      href={src.nepra_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded bg-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-600 transition-colors shrink-0"
                      title="Open Official NEPRA Document"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  {src.summary}
                </p>
                <div className="mt-2 text-[11px] text-neutral-500 font-mono">
                  Issuing Authority: {src.issuing_authority}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/60 text-xs text-neutral-500 flex items-center justify-between">
          <span>Authority: {manifestData.authority}</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
