import React, { memo } from 'react';
import { CropShape, LocketImage } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';

interface SidebarProps {
  images: LocketImage[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAdd: (file: File) => void;
  onRemove: (index: number) => void;
  onUpdate: (image: LocketImage) => void;
  onInherit: () => void;
}

const Sidebar: React.FC<SidebarProps> = memo(({ 
  images, 
  selectedIndex, 
  onSelect, 
  onAdd, 
  onRemove,
  onUpdate,
  onInherit
}) => {
  const selected = images[selectedIndex];

  const handleWidthChange = (val: string) => {
    const w = Math.max(0.1, parseFloat(val) || 0);
    if (selected.lockAspectRatio) {
      const ratio = selected.widthCm / selected.heightCm;
      onUpdate({ ...selected, widthCm: w, heightCm: w / ratio });
    } else {
      onUpdate({ ...selected, widthCm: w });
    }
  };

  const handleHeightChange = (val: string) => {
    const h = Math.max(0.1, parseFloat(val) || 0);
    if (selected.lockAspectRatio) {
      const ratio = selected.widthCm / selected.heightCm;
      onUpdate({ ...selected, heightCm: h, widthCm: h * ratio });
    } else {
      onUpdate({ ...selected, heightCm: h });
    }
  };

  return (
    <div className="w-80 border-r border-zinc-900 bg-zinc-950 flex flex-col shrink-0 z-20">
      <div className="flex-1 overflow-y-auto p-5 space-y-8 scroll-smooth">
        {/* Photos Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-zinc-500">Asset Queue</h3>
            <span className="px-2 py-0.5 bg-zinc-900 rounded-md text-[9px] font-bold text-zinc-500 border border-zinc-800">{images.length} / 12</span>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {images.map((img, i) => (
              <div 
                key={img.id} 
                onClick={() => onSelect(i)}
                className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer ring-offset-2 ring-offset-zinc-950 transition-all ${selectedIndex === i ? 'ring-2 ring-rose-500 scale-105' : 'ring-1 ring-zinc-800 hover:ring-zinc-600'}`}
              >
                <img src={img.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                <Button
                  onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                  variant="ghost"
                  className="absolute top-1 right-1 w-5 h-5 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:bg-rose-600 rounded-md flex items-center justify-center text-white text-[8px] p-0"
                >
                  ✕
                </Button>
              </div>
            ))}
            {images.length < 12 && (
              <label className="aspect-square rounded-lg border border-dashed border-zinc-800 hover:border-rose-500/50 hover:bg-rose-500/5 flex flex-col items-center justify-center cursor-pointer transition-all group">
                <svg className="w-4 h-4 text-zinc-600 group-hover:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v12m6-6H6"/></svg>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onAdd(e.target.files[0])} />
              </label>
            )}
          </div>
        </section>

        {selected ? (
          <div className="space-y-8 animate-in slide-in-from-left-2 duration-300 pb-12">
            {/* LOCKET FRAME SETTINGS */}
            <section className="p-4 bg-zinc-900/30 rounded-2xl border border-zinc-900 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-rose-500">1. Locket Frame</h3>
                <Button
                  onClick={() => onUpdate({ ...selected, lockAspectRatio: !selected.lockAspectRatio })}
                  variant={selected.lockAspectRatio ? 'default' : 'outline'}
                  className={`p-1.5 rounded-md ${selected.lockAspectRatio ? 'border-rose-500/50 text-rose-500 bg-rose-500/10' : 'border-zinc-800 text-zinc-600 hover:text-zinc-400'}`}
                  title="Lock Aspect Ratio"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-2zm-3-4h8v2H8z"/></svg>
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest pl-1">Width (cm)</label>
                  <Input
                    type="number" 
                    step="0.1"
                    value={selected.widthCm}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest pl-1">Height (cm)</label>
                  <Input
                    type="number" 
                    step="0.1"
                    value={selected.heightCm}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                {Object.values(CropShape).map((shape) => (
                  <Button
                    key={shape}
                    onClick={() => onUpdate({...selected, shape})}
                    variant={selected.shape === shape ? 'default' : 'outline'}
                    className={`px-2 py-2 text-[9px] font-bold ${selected.shape === shape ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : ''}`}
                  >
                    {shape}
                  </Button>
                ))}
              </div>
            </section>

            {/* PHOTO CONTENT SETTINGS */}
            <section className="p-4 bg-zinc-900/10 rounded-2xl border border-zinc-900/50 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-zinc-400">2. Photo Content</h3>
                {selectedIndex > 0 && (
                  <Button 
                    onClick={onInherit} 
                    variant="ghost"
                    className="text-[8px] text-rose-500 hover:text-rose-400 font-black uppercase tracking-widest border-b border-rose-500/20 pb-0.5 h-auto p-0"
                  >
                    Match First Photo
                  </Button>
                )}
              </div>
              
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">Photo Scale</label>
                    <span className="text-[10px] font-mono font-bold text-rose-500">{Math.round(selected.zoom * 100)}%</span>
                  </div>
                  <Slider
                    min={0.1}
                    max={5}
                    step={0.01}
                    value={[selected.zoom]}
                    onValueChange={(value) => onUpdate({...selected, zoom: value[0]})}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">Photo Rotation</label>
                    <span className="text-[10px] font-mono font-bold text-rose-500">{selected.rotation}°</span>
                  </div>
                  <Slider
                    min={-180}
                    max={180}
                    step={1}
                    value={[selected.rotation]}
                    onValueChange={(value) => onUpdate({...selected, rotation: value[0]})}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                 <div className="space-y-1">
                    <label className="text-[8px] font-bold text-zinc-700 uppercase pl-1">H-Pos</label>
                    <Input type="number" value={Math.round(selected.offsetX)} onChange={(e) => onUpdate({...selected, offsetX: parseFloat(e.target.value) || 0})} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-bold text-zinc-700 uppercase pl-1">V-Pos</label>
                    <Input type="number" value={Math.round(selected.offsetY)} onChange={(e) => onUpdate({...selected, offsetY: parseFloat(e.target.value) || 0})} />
                 </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <svg className="w-12 h-12 text-zinc-800 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 text-center px-4 leading-relaxed">Select an asset to unlock precision controls</p>
          </div>
        )}
      </div>

      <div className="p-5 border-t border-zinc-900 bg-zinc-950/50 backdrop-blur-md">
         <div className="flex items-start gap-3">
            <div className="mt-1 w-4 h-4 rounded-full border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-600 font-bold text-[8px]">!</div>
            <p className="text-[9px] leading-relaxed text-zinc-500 font-medium uppercase tracking-tight">CM dimensions are physical print targets. Scale affects the image size relative to the frame.</p>
         </div>
      </div>
    </div>
  );
});

export default Sidebar;
