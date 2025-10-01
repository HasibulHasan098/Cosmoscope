
import React from 'react';
import type { NasaPhoto } from '../types';

interface ImageGalleryProps {
  photos: NasaPhoto[];
  onImageSelect: (photo: NasaPhoto) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ photos, onImageSelect }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="group relative aspect-square overflow-hidden rounded-lg shadow-lg cursor-pointer"
          onClick={() => onImageSelect(photo)}
        >
          <img
            src={photo.img_src}
            alt={`Mars Rover photo by ${photo.rover.name} on Sol ${photo.sol}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
            <p className="text-xs text-white">
              {photo.camera.full_name} ({photo.camera.name})
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
