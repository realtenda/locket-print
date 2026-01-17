import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CropShape, LocketImage, PrintJob } from './types';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import HistoryPanel from './components/HistoryPanel';
import PrintPreview from './components/PrintPreview';
import { saveProjectState, loadHistory, restoreProjectState } from './utils/storage';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from './components/ui/dialog';

const App: React.FC = () => {
  const [images, setImages] = useState<LocketImage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [history, setHistory] = useState<PrintJob[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    const saved = loadHistory();
    if (saved) {
      setHistory(saved);
    }
  }, []);

  // Auto-save project state whenever images change
  useEffect(() => {
    if (images.length > 0) {
      saveProjectState(images, selectedIndex);
    }
  }, [images, selectedIndex]);

  const handleAddImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const newImage: LocketImage = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        url,
        shape: CropShape.CIRCLE,
        widthCm: 2.5,
        heightCm: 2.5,
        lockAspectRatio: false,
        zoom: 1.2, // Default slightly zoomed in for better initial crop
        rotation: 0,
        offsetX: 50,
        offsetY: 50,
      };
      setImages(prev => {
        const next = [...prev, newImage];
        setSelectedIndex(next.length - 1);
        return next;
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const updateImage = useCallback((updated: LocketImage) => {
    setImages(prev => prev.map((img) => img.id === updated.id ? updated : img));
  }, []);

  const inheritTransforms = useCallback(() => {
    if (images.length < 2 || selectedIndex === -1) return;
    const first = images[0];
    const updated = {
      ...images[selectedIndex],
      shape: first.shape,
      widthCm: first.widthCm,
      heightCm: first.heightCm,
      lockAspectRatio: first.lockAspectRatio,
      zoom: first.zoom,
      rotation: first.rotation,
      offsetX: first.offsetX,
      offsetY: first.offsetY,
    };
    updateImage(updated);
  }, [images, selectedIndex, updateImage]);

  const handlePrint = () => {
    const newJob = saveProjectState(images, selectedIndex);
    setHistory(prev => [newJob, ...prev]);
    window.print();
    setIsPrintModalOpen(false);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (selectedIndex >= index) setSelectedIndex(prevIdx => Math.max(-1, prevIdx - 1));
      return next;
    });
  };

  const restoreProject = useCallback((jobId: string) => {
    const projectState = restoreProjectState(jobId);
    if (projectState) {
      setImages(projectState.images);
      setSelectedIndex(projectState.selectedIndex);
      setShowHistory(false);
    }
  }, []);

  const selectedImage = images[selectedIndex];
  const printPortalNode = document.getElementById('print-area');

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 no-print selection:bg-rose-500/30">
      {printPortalNode && createPortal(<PrintPreview images={images} />, printPortalNode)}

      <header className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 shrink-0 bg-zinc-950/80 backdrop-blur-xl z-30">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
             <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white/90 uppercase tracking-[0.1em]">LocketPrint</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <nav className="flex bg-zinc-900/50 p-1 rounded-lg border border-zinc-800/50 mr-4">
            <Button 
              onClick={() => setShowHistory(false)} 
              variant={!showHistory ? 'default' : 'ghost'}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold ${!showHistory ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Editor
            </Button>
            <Button 
              onClick={() => setShowHistory(true)}
              variant={showHistory ? 'default' : 'ghost'}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold ${showHistory ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              History
            </Button>
          </nav>

          <Button 
            onClick={() => setIsPrintModalOpen(true)}
            disabled={images.length === 0}
            className="bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:grayscale"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            Review Sheet
          </Button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        {showHistory ? (
          <HistoryPanel history={history} onRestoreProject={restoreProject} />
        ) : (
          <>
            <Sidebar 
              images={images}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
              onAdd={handleAddImage}
              onRemove={removeImage}
              onUpdate={updateImage}
              onInherit={inheritTransforms}
            />

            <div className="flex-1 bg-[#0c0c0e] overflow-hidden flex flex-col items-center justify-center p-8 relative editor-grid">
              {selectedImage ? (
                <Editor image={selectedImage} onUpdate={updateImage} />
              ) : (
                <div className="text-center animate-in fade-in zoom-in duration-500">
                  <div className="mb-6 w-20 h-20 mx-auto bg-zinc-900 rounded-3xl flex items-center justify-center border border-zinc-800 shadow-xl">
                    <svg className="w-10 h-10 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-widest">Start Design</h2>
                  <p className="text-zinc-500 mt-2 max-w-xs mx-auto text-xs uppercase tracking-tight leading-relaxed">Import a high-resolution portrait to begin calibrating your physical locket print.</p>
                  <label className="mt-8 inline-flex items-center gap-3 bg-rose-600 hover:bg-rose-500 px-10 py-4 rounded-2xl cursor-pointer transition-all text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-rose-900/40 active:scale-95">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                    Upload Photo
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleAddImage(e.target.files[0])} />
                  </label>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-black/95 backdrop-blur-2xl p-4 sm:p-8 overflow-y-auto animate-in fade-in duration-300">
          <div className="sticky top-0 z-10 w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-900/90 p-4 sm:p-6 rounded-3xl border border-zinc-800 backdrop-blur-md mb-8 shadow-2xl">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center border border-zinc-700">
                <svg className="w-7 h-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-widest text-white">Final Layout Preview</h2>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest opacity-80">Physical Scale: 1:1 • Paper: ISO A4</p>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button onClick={() => setIsPrintModalOpen(false)} variant="outline" className="flex-1 sm:flex-none">Exit</Button>
              <Button onClick={handlePrint} className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-500 flex items-center justify-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                 Start Print
              </Button>
            </div>
          </div>
          
          <div className="flex-1 w-full flex items-center justify-center py-8">
            <div className="a4-sheet border-none preview-shadow scale-[0.4] sm:scale-[0.6] md:scale-[0.8] lg:scale-90 xl:scale-100 transition-transform origin-center">
              <PrintPreview images={images} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
