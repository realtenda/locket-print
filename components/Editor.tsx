import React, { useRef, useState, useCallback, useMemo } from 'react';
import { LocketImage, CropShape } from '../types';
import { Button } from './ui/button';

interface EditorProps {
  image: LocketImage;
  onUpdate: (image: LocketImage) => void;
}

const Editor: React.FC<EditorProps> = ({ image, onUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    
    const rect = containerRef.current.getBoundingClientRect();
    const moveX = (dx / rect.width) * 100;
    const moveY = (dy / rect.height) * 100;

    onUpdate({
      ...image,
      offsetX: image.offsetX + moveX,
      offsetY: image.offsetY + moveY,
    });
    
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, [isDragging, image, onUpdate]);

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.02 : 0.02;
    onUpdate({
      ...image,
      zoom: Math.min(Math.max(0.1, image.zoom + delta), 10)
    });
  };

  const resetPhoto = () => {
    onUpdate({ ...image, zoom: 1, offsetX: 50, offsetY: 50, rotation: 0 });
  };

  const dimensions = useMemo(() => {
    const aspectRatio = image.widthCm / image.heightCm;
    const maxSize = 450;
    let w = maxSize;
    let h = maxSize / aspectRatio;
    if (h > maxSize) {
      h = maxSize;
      w = h * aspectRatio;
    }
    return { w, h };
  }, [image.widthCm, image.heightCm]);

  const getMaskClass = () => {
    switch (image.shape) {
      case CropShape.CIRCLE: return 'rounded-full';
      case CropShape.OVAL: return 'rounded-[100%]';
      case CropShape.HEART: return 'heart-mask-responsive';
      case CropShape.RECTANGLE: return 'rounded-none';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
      <div className="mb-8 flex gap-3 text-[9px] font-black tracking-[0.2em] text-zinc-500 bg-zinc-950/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-zinc-900 shadow-2xl">
        <div className="flex flex-col gap-1 items-center">
          <span className="text-rose-500">LOCKET SIZE</span>
          <span className="text-white text-xs">{image.widthCm}cm × {image.heightCm}cm</span>
        </div>
        <div className="w-px h-6 bg-zinc-800 self-center mx-2"></div>
        <div className="flex flex-col gap-1 items-center">
          <span className="text-zinc-500">PHOTO SCALE</span>
          <span className="text-white text-xs">{Math.round(image.zoom * 100)}%</span>
        </div>
      </div>

      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ width: dimensions.w, height: dimensions.h }}
        className="relative bg-zinc-900/50 cursor-move border border-zinc-800/50 shadow-2xl"
      >
        {/* Background Ghost Layer (Bleed Visualization) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <img 
            src={image.url}
            alt="bleed"
            draggable={false}
            style={{
              width: `${image.zoom * 100}%`,
              position: 'absolute',
              left: `${image.offsetX}%`,
              top: `${image.offsetY}%`,
              transform: `translate(-50%, -50%) rotate(${image.rotation}deg)`,
              transformOrigin: 'center center'
            }}
            className="max-w-none grayscale"
          />
        </div>

        {/* Foreground Masked Layer (Final Result) */}
        <div className={`absolute inset-0 flex items-center justify-center overflow-hidden ${getMaskClass()} pointer-events-none ring-1 ring-rose-500/30 bg-black/40`}>
           <img 
            src={image.url}
            alt="masked"
            draggable={false}
            style={{
              width: `${image.zoom * 100}%`,
              position: 'absolute',
              left: `${image.offsetX}%`,
              top: `${image.offsetY}%`,
              transform: `translate(-50%, -50%) rotate(${image.rotation}deg)`,
              transformOrigin: 'center center'
            }}
            className="max-w-none"
          />
        </div>

        {/* Dynamic Crosshair Guide */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-1/2 left-0 w-full h-[0.5px] bg-rose-500/20" />
           <div className="absolute left-1/2 top-0 w-[0.5px] h-full bg-rose-500/20" />
        </div>
      </div>
      
      <div className="mt-10 flex flex-col items-center gap-6">
        <div className="flex bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 shadow-2xl backdrop-blur-xl">
          <Button onClick={resetPhoto} variant="ghost" className="px-5 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl flex items-center gap-2 group">
            <svg className="w-4 h-4 group-active:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Reset View</span>
          </Button>
          <div className="w-px h-6 bg-zinc-800 self-center mx-2"></div>
          <Button 
            onClick={() => onUpdate({...image, rotation: image.rotation + 90})}
            variant="ghost"
            className="p-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl"
            title="Rotate View"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </Button>
        </div>

        <div className="flex items-center gap-4 text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">
           <span>← Move Photo →</span>
           <div className="w-1 h-1 bg-zinc-800 rounded-full" />
           <span>↕ Scroll Scale ↕</span>
        </div>
      </div>
    </div>
  );
};

export default Editor;