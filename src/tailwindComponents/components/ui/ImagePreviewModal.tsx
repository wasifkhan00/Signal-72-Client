import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./dialog";
import { Button } from "./button";
import {
  X,
  Download,
  Share,
  ChevronLeft,
  ChevronRight,
  RotateCw,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface ImagePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  alt?: string;
  senderName?: string;
  timestamp?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  currentIndex?: number;
  totalImages?: number;
}

export function ImagePreviewModal({
  open,
  onOpenChange,
  imageUrl,
  alt = "Image",
  senderName,
  timestamp,
  onPrevious,
  onNext,
  hasNext = false,
  hasPrevious = false,
  currentIndex,
  totalImages,
}: ImagePreviewModalProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "image.png";
    link.click();
  };

  const handleShare = () => {
    console.log("Share image:", imageUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* <DialogContent className="w-full h-[90vh] p-0 bg-black/90 border-0 overflow-hidden sm:max-w-xl md:max-w-3xl lg:max-w-5xl"> */}
      <DialogContent className="w-full h-[90vh] p-0 bg-black/90 border-0 overflow-hidden flex items-center justify-center">
        {/* <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black/90 border-0 overflow-hidden "> */}
        {/* <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black/90 border-0 overflow-hidden"> */}
        <DialogTitle className="sr-only">
          {senderName ? `Image from ${senderName}` : "Image Preview"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Full screen preview of shared image. Use arrow keys to navigate or
          press Escape to close.
        </DialogDescription>
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-3">
              {senderName && (
                <div className="text-white">
                  <p className="font-medium">{senderName}</p>
                  {timestamp && (
                    <p className="text-xs text-white/70">{timestamp}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/20 rounded-full"
                onClick={handleDownload}
              >
                <Download className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/20 rounded-full"
                onClick={handleShare}
              >
                <Share className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/20 rounded-full"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center p-4 relative">
            {/* Previous Button */}
            {hasPrevious && onPrevious && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-12 w-12 text-white hover:bg-white/20 rounded-full z-10 backdrop-blur-sm"
                onClick={onPrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}

            {/* Image */}
            <div className="inline-block max-w-[90vw] max-h-[90vh]">
              {/* <div className="relative max-w-full max-h-full"> */}
              <ImageWithFallback
                src={imageUrl}
                alt={alt}
                className="rounded-lg shadow-1xl"
                // className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />

              {/* Image counter */}
              {totalImages && totalImages > 1 && currentIndex !== undefined && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black/50 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                    {currentIndex + 1} of {totalImages}
                  </div>
                </div>
              )}
            </div>

            {/* Next Button */}
            {hasNext && onNext && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 h-12 w-12 text-white hover:bg-white/20 rounded-full z-10 backdrop-blur-sm"
                onClick={onNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </div>

          {/* Bottom gradient for better UI */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
