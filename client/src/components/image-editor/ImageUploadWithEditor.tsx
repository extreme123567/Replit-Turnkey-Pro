import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageEditor } from './ImageEditor';
import { 
  Upload, 
  Camera, 
  Edit, 
  X, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

interface ImageUploadWithEditorProps {
  onSave: (file: File, annotations?: any[]) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  maxFiles?: number;
  accept?: string;
  required?: boolean;
  existingImages?: Array<{
    id: string;
    url: string;
    annotations?: any[];
    uploaded?: boolean;
  }>;
}

export function ImageUploadWithEditor({
  onSave,
  onCancel,
  title = "Upload Images",
  description = "Select images to upload and annotate them with markers, notes, and highlights",
  maxFiles = 3,
  accept = "image/*",
  required = false,
  existingImages = []
}: ImageUploadWithEditorProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedImages, setEditedImages] = useState<Map<number, { blob: Blob, annotations: any[] }>>(new Map());
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    const totalFiles = selectedFiles.length + validFiles.length;

    if (totalFiles > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images.`);
      return;
    }

    const newFiles = [...selectedFiles, ...validFiles.slice(0, maxFiles - selectedFiles.length)];
    setSelectedFiles(newFiles);

    // Create preview URLs
    const newUrls = validFiles.slice(0, maxFiles - selectedFiles.length).map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newUrls]);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = Array.from(event.dataTransfer.files);
    addFiles(files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
    
    // Remove from edited images if exists
    const newEditedImages = new Map(editedImages);
    newEditedImages.delete(index);
    setEditedImages(newEditedImages);
  };

  const openEditor = (index: number) => {
    setEditingIndex(index);
  };

  const closeEditor = () => {
    setEditingIndex(null);
  };

  const handleImageEdit = (blob: Blob, annotations: any[]) => {
    if (editingIndex !== null) {
      const newEditedImages = new Map(editedImages);
      newEditedImages.set(editingIndex, { blob, annotations });
      setEditedImages(newEditedImages);
      closeEditor();
    }
  };

  const handleSaveAll = async () => {
    for (let i = 0; i < selectedFiles.length; i++) {
      const originalFile = selectedFiles[i];
      const editedData = editedImages.get(i);
      
      if (editedData) {
        // Convert blob to file with original filename
        const editedFile = new File([editedData.blob], originalFile.name, {
          type: 'image/png',
          lastModified: Date.now()
        });
        onSave(editedFile, editedData.annotations);
      } else {
        onSave(originalFile, []);
      }
    }
    
    // Clean up URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
  };

  const canSave = selectedFiles.length > 0 || (!required && selectedFiles.length === 0);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>{title}</span>
          </div>
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel} data-testid="button-cancel-upload">
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
        <p className="text-sm text-slate-600">{description}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-slate-800">Existing Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                    <img
                      src={image.url}
                      alt="Existing"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant={image.uploaded ? "default" : "secondary"} className="text-xs">
                      {image.uploaded ? "Uploaded" : "Pending"}
                    </Badge>
                  </div>
                  {image.annotations && image.annotations.length > 0 && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="text-xs bg-white">
                        <Edit className="h-3 w-3 mr-1" />
                        Annotated
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-slate-300 hover:border-slate-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <Upload className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-800">
                Drop images here or click to browse
              </p>
              <p className="text-sm text-slate-600">
                Support for JPG, PNG files. Max {maxFiles} files.
              </p>
            </div>
            <div>
              <Label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer" data-testid="button-browse-files">
                  <Upload className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept={accept}
                multiple={maxFiles > 1}
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-file-upload"
              />
            </div>
          </div>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-slate-800">Selected Images ({selectedFiles.length}/{maxFiles})</h3>
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready to annotate
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                    <img
                      src={previewUrls[index]}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Image Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => openEditor(index)}
                        className="bg-blue-600 hover:bg-blue-700"
                        data-testid={`button-edit-image-${index}`}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFile(index)}
                        data-testid={`button-remove-image-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="absolute top-2 left-2 flex space-x-1">
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(file.size / 1024)}KB
                    </Badge>
                    {editedImages.has(index) && (
                      <Badge variant="default" className="text-xs bg-green-600">
                        <Edit className="h-3 w-3 mr-1" />
                        Edited
                      </Badge>
                    )}
                  </div>

                  {/* File Name */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-xs text-white bg-black bg-opacity-75 rounded px-2 py-1 truncate">
                      {file.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-slate-600">
            {required && selectedFiles.length === 0 && (
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                At least one image is required
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} data-testid="button-cancel-upload-bottom">
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSaveAll}
              disabled={!canSave}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-save-all-images"
            >
              <Upload className="h-4 w-4 mr-2" />
              Save All Images ({selectedFiles.length})
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Image Editor Modal */}
      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-6xl max-h-full overflow-auto">
            <ImageEditor
              imageUrl={previewUrls[editingIndex]}
              onSave={handleImageEdit}
              onClose={closeEditor}
              initialAnnotations={editedImages.get(editingIndex)?.annotations || []}
            />
          </div>
        </div>
      )}
    </Card>
  );
}