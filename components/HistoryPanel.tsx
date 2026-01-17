import React from 'react';
import { PrintJob } from '../types';

interface HistoryPanelProps {
  history: PrintJob[];
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history }) => {
  return (
    <div className="flex-1 overflow-y-auto p-12 bg-[#0c0c0e]">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Print Vault</h2>
            <p className="text-zinc-500 mt-1">Review your past physical production runs</p>
          </div>
          <div className="px-5 py-2.5 bg-zinc-900 rounded-2xl border border-zinc-800 font-mono text-xs font-bold text-rose-500">
            {history.length} RECORDS
          </div>
        </div>
        
        {history.length === 0 ? (
          <div className="py-24 border border-dashed border-zinc-800 rounded-3xl text-center bg-zinc-900/20">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">
              <svg className="w-8 h-8 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p className="text-zinc-500 font-medium">Your print archive is currently empty.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((job) => (
              <div 
                key={job.id} 
                className="group bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl flex items-center justify-between hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-default"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-zinc-950 flex flex-col items-center justify-center border border-zinc-800 group-hover:border-rose-500/30 transition-colors">
                    <span className="text-[9px] font-black text-zinc-600 group-hover:text-rose-500 tracking-tighter uppercase">ID</span>
                    <span className="text-sm font-bold text-white">{job.id.slice(-3)}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold group-hover:text-rose-500 transition-colors tracking-tight">Standard Sheet Batch</h4>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                      {new Date(job.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="px-3 py-1 bg-zinc-950 rounded-lg border border-zinc-800 text-[10px] font-black text-zinc-400 uppercase tracking-widest inline-block mb-1">
                    {job.imagesCount} Photos
                  </div>
                  <div className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">ISO 216 A4 Layout</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;