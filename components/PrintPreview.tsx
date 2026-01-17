import React from 'react';
import { LocketImage, CropShape } from '../types';

interface PrintPreviewProps {
  images: LocketImage[];
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ images }) => {
  return (
    <div className="a4-sheet p-[15mm] flex flex-wrap gap-[15mm] items-start content-start bg-white">
      {/* Hidden Calibration Guide */}
      <div className="absolute bottom-[15mm] right-[15mm] flex flex-col items-end opacity-20 no-print-optional">
        <div className="w-[50mm] h-[0.1mm] bg-black mb-1"></div>
        <div className="flex justify-between w-[50mm] text-[7px] font-bold uppercase tracking-tighter">
          <span>0mm</span>
          <span>50mm (5cm) Calibrator</span>
        </div>
      </div>

      {images.map((image) => (
        <PrintItem key={image.id} image={image} />
      ))}
    </div>
  );
};

const PrintItem: React.FC<{ image: LocketImage }> = ({ image }) => {
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
    <div className="flex flex-col items-center gap-2">
      <div 
        style={{ 
          width: `${image.widthCm}cm`, 
          height: `${image.heightCm}cm`,
          border: '0.1mm solid #eee' // Precision cutting guide
        }} 
        className={`relative overflow-hidden ${getMaskClass()} bg-white`}
      >
        <img 
          src={image.url} 
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
      <div className="flex flex-col items-center">
        <span className="text-[7px] text-zinc-400 font-bold uppercase tracking-widest leading-none">
          {image.widthCm}×{image.heightCm} CM
        </span>
        <span className="text-[5px] text-zinc-300 font-medium uppercase mt-0.5">
          {image.shape}
        </span>
      </div>
    </div>
  );
};

export default PrintPreview;