import React, { useState } from "react";
import { ZoomIn, X } from "lucide-react";
import type { ConsultationImage } from "../../../../hooks/UseCustomer";

interface ImageGalleryProps {
  images: ConsultationImage[];
  baseUrl?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  baseUrl = "https://api.in2skincare.com",
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className="bg-white border border-rose-100 rounded-lg p-4 shadow-sm">
        <h3 className="text-rose-700 font-semibold mb-3">
          Patient Photos ({images.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-rose-300 transition-colors"
              onClick={() => setSelectedImage(`${baseUrl}/${image.image_url}`)}
            >
              <img
                src={`${baseUrl}/${image.image_url}`}
                alt={`Consultation photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                <ZoomIn
                  size={20}
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-rose-200 transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={selectedImage}
              alt="Enlarged consultation photo"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};