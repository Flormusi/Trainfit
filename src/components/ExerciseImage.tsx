import React, { useState } from 'react';
import { getExerciseImageUrl } from '../services/cloudinaryService';

interface ExerciseImageProps {
  exerciseName: string;
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
}

const ExerciseImage: React.FC<ExerciseImageProps> = ({
  exerciseName,
  width = 300,
  height = 200,
  className = '',
  alt
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const imageUrl = getExerciseImageUrl(exerciseName, width, height);
  const fallbackUrl = '/images/exercises/placeholder.svg';

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Cargando...</div>
        </div>
      )}
      
      <img
        src={imageError ? fallbackUrl : imageUrl}
        alt={alt || exerciseName}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
      
      {imageError && !isLoading && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Imagen no disponible
        </div>
      )}
    </div>
  );
};

export default ExerciseImage;