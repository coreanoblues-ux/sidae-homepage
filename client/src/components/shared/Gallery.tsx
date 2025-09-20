import { useState } from "react";
import { Lightbox } from "@/components/ui/lightbox";

interface GalleryProps {
  images: string[];
  className?: string;
}

export function Gallery({ images, className = "" }: GalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {images.map((image, index) => (
          <div
            key={index}
            className="gallery-item cursor-pointer card-hover"
            onClick={() => openLightbox(index)}
          >
            <img
              src={image}
              alt={`갤러리 이미지 ${index + 1}`}
              loading="lazy"
              onError={(e) => {
                console.error('Gallery image failed to load:', image);
                // 가이드에 따른 에러 핸들링 제거 - 실제 이미지 로드 허용
              }}
              className="rounded-lg object-cover w-full aspect-square"
            />
          </div>
        ))}
      </div>

      <Lightbox
        images={images}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onPrevious={goToPrevious}
        onNext={goToNext}
      />
    </>
  );
}
