import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Pencil, 
  Eraser, 
  Download, 
  Undo, 
  Redo, 
  Palette, 
  Square,
  Circle,
  Type,
  Save,
  X,
  RotateCcw
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface DrawingAction {
  type: 'draw' | 'erase' | 'shape' | 'text';
  points?: Point[];
  color?: string;
  size?: number;
  shapeType?: 'rectangle' | 'circle';
  text?: string;
  position?: Point;
}

interface ImageEditorProps {
  imageUrl: string;
  onSave?: (editedImageBlob: Blob, annotations: DrawingAction[]) => void;
  onClose?: () => void;
  readOnly?: boolean;
  initialAnnotations?: DrawingAction[];
}

const COLORS = [
  '#ef4444', // red
  '#f97316', // orange  
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#000000', // black
  '#ffffff', // white
];

const BRUSH_SIZES = [2, 4, 6, 8, 12, 16];

export function ImageEditor({ 
  imageUrl, 
  onSave, 
  onClose, 
  readOnly = false,
  initialAnnotations = []
}: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'draw' | 'erase' | 'rectangle' | 'circle' | 'text'>('draw');
  const [color, setColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(4);
  const [history, setHistory] = useState<DrawingAction[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState<Point>({ x: 0, y: 0 });

  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageData = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
    if (imageData) {
      // Save current state to history
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push({ type: 'draw', points: [] }); // Simplified history entry
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    }
  }, [history, historyStep]);

  const loadImage = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Draw the original image
    ctx.drawImage(image, 0, 0);
    
    // Apply initial annotations if provided
    if (initialAnnotations.length > 0) {
      initialAnnotations.forEach(annotation => {
        applyAnnotation(ctx, annotation);
      });
    }

    setIsLoading(false);
    saveCanvasState();
  }, [initialAnnotations, saveCanvasState]);

  const applyAnnotation = (ctx: CanvasRenderingContext2D, annotation: DrawingAction) => {
    ctx.globalCompositeOperation = annotation.type === 'erase' ? 'destination-out' : 'source-over';
    
    if (annotation.color) ctx.strokeStyle = annotation.color;
    if (annotation.size) ctx.lineWidth = annotation.size;

    switch (annotation.type) {
      case 'draw':
      case 'erase':
        if (annotation.points && annotation.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
          for (let i = 1; i < annotation.points.length; i++) {
            ctx.lineTo(annotation.points[i].x, annotation.points[i].y);
          }
          ctx.stroke();
        }
        break;
      case 'shape':
        if (annotation.points && annotation.points.length === 2) {
          const [start, end] = annotation.points;
          if (annotation.shapeType === 'rectangle') {
            ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
          } else if (annotation.shapeType === 'circle') {
            const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            ctx.beginPath();
            ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
          }
        }
        break;
      case 'text':
        if (annotation.text && annotation.position) {
          ctx.font = `${annotation.size || 16}px Arial`;
          ctx.fillStyle = annotation.color || '#000000';
          ctx.fillText(annotation.text, annotation.position.x, annotation.position.y);
        }
        break;
    }
  };

  useEffect(() => {
    const image = imageRef.current;
    if (image) {
      if (image.complete) {
        loadImage();
      } else {
        image.onload = loadImage;
      }
    }
  }, [loadImage]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    
    const pos = getMousePos(e);

    if (tool === 'text') {
      setTextPosition(pos);
      setShowTextInput(true);
      return;
    }

    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = tool === 'erase' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'draw' || tool === 'erase') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return;

    const pos = getMousePos(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    if (tool === 'draw' || tool === 'erase') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveCanvasState();
  };

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      // Redraw from history
      redrawCanvas();
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      redrawCanvas();
    }
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    saveCanvasState();
  };

  const addText = () => {
    if (!textInput.trim()) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.font = `${brushSize * 2}px Arial`;
    ctx.fillStyle = color;
    ctx.fillText(textInput, textPosition.x, textPosition.y);

    setTextInput('');
    setShowTextInput(false);
    saveCanvasState();
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob && onSave) {
        onSave(blob, history);
      }
    }, 'image/png');
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-slate-500">Loading image editor...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Image Editor</span>
            {readOnly && <Badge variant="outline">View Only</Badge>}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onClose} data-testid="button-close-editor">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tools */}
        {!readOnly && (
          <div className="flex flex-wrap items-center gap-2 p-4 bg-slate-50 rounded-lg">
            {/* Drawing Tools */}
            <div className="flex items-center space-x-2">
              <Button
                variant={tool === 'draw' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('draw')}
                data-testid="button-draw-tool"
              >
                <Pencil className="h-4 w-4 mr-1" />
                Draw
              </Button>
              <Button
                variant={tool === 'erase' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('erase')}
                data-testid="button-erase-tool"
              >
                <Eraser className="h-4 w-4 mr-1" />
                Erase
              </Button>
              <Button
                variant={tool === 'rectangle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('rectangle')}
                data-testid="button-rectangle-tool"
              >
                <Square className="h-4 w-4 mr-1" />
                Rectangle
              </Button>
              <Button
                variant={tool === 'circle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('circle')}
                data-testid="button-circle-tool"
              >
                <Circle className="h-4 w-4 mr-1" />
                Circle
              </Button>
              <Button
                variant={tool === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('text')}
                data-testid="button-text-tool"
              >
                <Type className="h-4 w-4 mr-1" />
                Text
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Colors */}
            <div className="flex items-center space-x-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={`w-6 h-6 rounded border-2 ${
                    color === c ? 'border-slate-400' : 'border-slate-200'
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  data-testid={`button-color-${c}`}
                />
              ))}
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Brush Sizes */}
            <div className="flex items-center space-x-1">
              {BRUSH_SIZES.map((size) => (
                <Button
                  key={size}
                  variant={brushSize === size ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBrushSize(size)}
                  className="px-2"
                  data-testid={`button-brush-${size}`}
                >
                  {size}px
                </Button>
              ))}
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={historyStep <= 0}
                data-testid="button-undo"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={historyStep >= history.length - 1}
                data-testid="button-redo"
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCanvas}
                data-testid="button-clear"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Save/Download */}
            <div className="flex items-center space-x-2">
              {onSave && (
                <Button
                  size="sm"
                  onClick={saveImage}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-save-image"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={downloadImage}
                data-testid="button-download-image"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        )}

        {/* Text Input Modal */}
        {showTextInput && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg space-y-4">
              <h3 className="font-semibold">Add Text</h3>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text..."
                className="w-full px-3 py-2 border border-slate-300 rounded"
                autoFocus
                data-testid="input-text-annotation"
              />
              <div className="flex space-x-2">
                <Button onClick={addText} size="sm">Add</Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowTextInput(false)} 
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Original"
            style={{ display: 'none' }}
            crossOrigin="anonymous"
          />
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{ 
              cursor: tool === 'text' ? 'text' : 'crosshair',
              maxHeight: '70vh'
            }}
            data-testid="canvas-image-editor"
          />
        </div>
      </CardContent>
    </Card>
  );
}