export enum CropShape {
  CIRCLE = 'CIRCLE',
  HEART = 'HEART',
  OVAL = 'OVAL',
  RECTANGLE = 'RECTANGLE'
}

export interface LocketImage {
  id: string;
  name: string;
  url: string;
  shape: CropShape;
  widthCm: number;
  heightCm: number;
  lockAspectRatio: boolean;
  zoom: number;
  rotation: number;
  offsetX: number; // in percentage
  offsetY: number; // in percentage
}

export interface PrintJob {
  id: string;
  timestamp: number;
  imagesCount: number;
}
