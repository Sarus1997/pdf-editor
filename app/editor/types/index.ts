export type AnnotationType =
  | 'text'
  | 'highlight'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'strikeout'
  | 'underline'
  | 'freehand'
  | 'signature';

export interface Annotation {
  id: string;
  type: AnnotationType;
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  strokeWidth?: number;
  opacity?: number;
  points?: { x: number; y: number }[]; // For freehand and arrow polyline
}

export interface PdfDocument {
  id: string;
  name: string;
  url: string;
  totalPages: number;
  annotations: Annotation[];
}
