import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageEditor } from './ImageEditor';
import { 
  Edit, 
  Download, 
  Eye, 
  X, 
  Calendar,
  User,
  MapPin,
  Camera
} from 'lucide-react';

interface ImageData {
  id: string;
  url: string;
  filename?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  annotations?: any[];
  description?: string;
  location?: string;
  tags?: string[];
}

interface ImageGalleryProps {
  images: ImageData[];
  onImageSave?: (imageId: string, editedBlob: Blob, annotations: any[]) => void;
  onImageDelete?: (imageId: string) => void;
  title?: string;
  readOnly?: boolean;
  allowDownload?: boolean;
  showMetadata?: boolean;
}

export function ImageGallery({
  images,
  onImageSave,
  onImageDelete,
  title = "Image Gallery",
  readOnly = false,
  allowDownload = true,
  showMetadata = true
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [viewMode, setViewMode] = useState<'gallery' | 'editor' | 'preview'>('gallery');

  const openImageEditor = (image: ImageData) => {
    setSelectedImage(image);
    setViewMode('editor');
  };

  const openImagePreview = (image: ImageData) => {
    setSelectedImage(image);
    setViewMode('preview');
  };

  const closeViewer = () => {
    setSelectedImage(null);
    setViewMode('gallery');
  };

  const handleImageSave = (blob: Blob, annotations: any[]) => {
    if (selectedImage && onImageSave) {
      onImageSave(selectedImage.id, blob, annotations);
    }
    closeViewer();
  };

  const downloadImage = (image: ImageData) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.filename || `image-${image.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (images.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
            <Camera className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-600">No images available</p>
          <p className="text-sm text-slate-500 mt-1">Upload some images to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>{title}</span>
              <Badge variant="outline">{images.length} images</Badge>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.filename || 'Image'}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => openImagePreview(image)}
                    data-testid={`image-preview-${image.id}`}
                  />
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openImagePreview(image)}
                      data-testid={`button-view-image-${image.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {!readOnly && (
                      <Button
                        size="sm"
                        onClick={() => openImageEditor(image)}
                        className="bg-blue-600 hover:bg-blue-700"
                        data-testid={`button-edit-image-${image.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {allowDownload && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => downloadImage(image)}
                        data-testid={`button-download-image-${image.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="absolute top-2 left-2 flex space-x-1">
                  {image.annotations && image.annotations.length > 0 && (
                    <Badge variant="default" className="text-xs bg-blue-600">
                      <Edit className="h-3 w-3 mr-1" />
                      Edited
                    </Badge>
                  )}
                  {image.tags && image.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Metadata */}
                {showMetadata && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {image.filename || `Image ${image.id}`}
                    </p>
                    {image.description && (
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {image.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center space-x-2">
                        {image.uploadedBy && (
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {image.uploadedBy}
                          </div>
                        )}
                        {image.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {image.location}
                          </div>
                        )}
                      </div>
                      {image.uploadedAt && (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(image.uploadedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      {viewMode === 'preview' && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="secondary"
              size="sm"
              onClick={closeViewer}
              className="absolute top-4 right-4 z-10"
              data-testid="button-close-preview"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <img
              src={selectedImage.url}
              alt={selectedImage.filename || 'Image'}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{selectedImage.filename || 'Image'}</h3>
                  {selectedImage.description && (
                    <p className="text-sm text-slate-300 mt-1">{selectedImage.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  {!readOnly && (
                    <Button
                      size="sm"
                      onClick={() => setViewMode('editor')}
                      className="bg-blue-600 hover:bg-blue-700"
                      data-testid="button-edit-from-preview"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  {allowDownload && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => downloadImage(selectedImage)}
                      data-testid="button-download-from-preview"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Editor Modal */}
      {viewMode === 'editor' && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-6xl max-h-full overflow-auto">
            <ImageEditor
              imageUrl={selectedImage.url}
              onSave={handleImageSave}
              onClose={closeViewer}
              readOnly={readOnly}
              initialAnnotations={selectedImage.annotations || []}
            />
          </div>
        </div>
      )}
    </>
  );
}