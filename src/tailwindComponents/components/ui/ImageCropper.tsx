import React, { useState, useRef, useCallback, useEffect } from "react";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  imageUrl: string;
  onCropChange?: (cropArea: CropArea) => void;
  className?: string;
  rotation?: number;
}

export function ImageCropper({
  imageUrl,
  onCropChange,
  className,
  rotation = 0,
}: ImageCropperProps) {
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<"move" | "resize" | null>(null);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    cropX: 0,
    cropY: 0,
    cropW: 0,
    cropH: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, type: "move" | "resize") => {
      e.preventDefault();
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setIsDragging(true);
      setDragType(type);
      setDragStart({
        x,
        y,
        cropX: cropArea.x,
        cropY: cropArea.y,
        cropW: cropArea.width,
        cropH: cropArea.height,
      });
    },
    [cropArea]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current || !dragType) return;

      e.preventDefault();
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = ((e.clientX - rect.left) / rect.width) * 100;
      const currentY = ((e.clientY - rect.top) / rect.height) * 100;

      const deltaX = currentX - dragStart.x;
      const deltaY = currentY - dragStart.y;

      if (dragType === "move") {
        const newX = Math.max(
          0,
          Math.min(100 - cropArea.width, dragStart.cropX + deltaX)
        );
        const newY = Math.max(
          0,
          Math.min(100 - cropArea.height, dragStart.cropY + deltaY)
        );
        setCropArea((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (dragType === "resize") {
        const newWidth = Math.max(
          10,
          Math.min(100 - dragStart.cropX, dragStart.cropW + deltaX)
        );
        const newHeight = Math.max(
          10,
          Math.min(100 - dragStart.cropY, dragStart.cropH + deltaY)
        );
        setCropArea((prev) => ({
          ...prev,
          width: newWidth,
          height: newHeight,
        }));
      }
    },
    [isDragging, dragType, dragStart, cropArea]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
  }, []);

  useEffect(() => {
    if (onCropChange) {
      onCropChange(cropArea);
    }
  }, [cropArea, onCropChange]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Base image */}
      <img
        src={imageUrl}
        alt="Crop preview"
        className="w-full h-full object-contain select-none"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: "transform 0.3s ease",
        }}
        draggable={false}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* Crop area */}
      <div
        className="absolute border-2 border-white bg-transparent"
        style={{
          left: `${cropArea.x}%`,
          top: `${cropArea.y}%`,
          width: `${cropArea.width}%`,
          height: `${cropArea.height}%`,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Move handle (center area) */}
        <div
          className="absolute inset-2 cursor-move"
          onMouseDown={(e) => handleMouseDown(e, "move")}
        />

        {/* Corner resize handles */}
        <div
          className="absolute -top-1 -left-1 w-3 h-3 bg-white border border-gray-400 cursor-nw-resize"
          onMouseDown={(e) => handleMouseDown(e, "resize")}
        />
        <div
          className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-gray-400 cursor-ne-resize"
          onMouseDown={(e) => handleMouseDown(e, "resize")}
        />
        <div
          className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-gray-400 cursor-sw-resize"
          onMouseDown={(e) => handleMouseDown(e, "resize")}
        />
        <div
          className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-gray-400 cursor-se-resize"
          onMouseDown={(e) => handleMouseDown(e, "resize")}
        />

        {/* Edge resize handles */}
        <div
          className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-white border border-gray-400 cursor-n-resize"
          onMouseDown={(e) => handleMouseDown(e, "resize")}
        />
        <div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-white border border-gray-400 cursor-s-resize"
          onMouseDown={(e) => handleMouseDown(e, "resize")}
        />
        <div
          className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-3 bg-white border border-gray-400 cursor-w-resize"
          onMouseDown={(e) => handleMouseDown(e, "resize")}
        />
        <div
          className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-3 bg-white border border-gray-400 cursor-e-resize"
          onMouseDown={(e) => handleMouseDown(e, "resize")}
        />
      </div>

      {/* Grid lines */}
      <div
        className="absolute border border-white/30 pointer-events-none"
        style={{
          left: `${cropArea.x}%`,
          top: `${cropArea.y}%`,
          width: `${cropArea.width}%`,
          height: `${cropArea.height}%`,
        }}
      >
        {/* Rule of thirds grid */}
        <div className="absolute top-1/3 left-0 right-0 border-t border-white/20" />
        <div className="absolute top-2/3 left-0 right-0 border-t border-white/20" />
        <div className="absolute left-1/3 top-0 bottom-0 border-l border-white/20" />
        <div className="absolute left-2/3 top-0 bottom-0 border-l border-white/20" />
      </div>
    </div>
  );
}
