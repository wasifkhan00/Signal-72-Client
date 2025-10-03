import React, { useState } from "react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Button } from "./button";
import { Input } from "./input";
import { Send, X } from "lucide-react";

interface ImageMessageProps {
  imageUrl: string;
  isOwn: boolean;
  onImageClick: () => void;
  caption?: string;
  onCaptionUpdate?: (caption: string) => void;
  timeStamp?: string;
  dateStamp?: string;
  alt?: string;
}

export function ImageMessage({
  imageUrl,
  isOwn,
  onImageClick,
  caption,
  onCaptionUpdate,
  timeStamp,
  dateStamp,
  alt = "Shared image",
}: ImageMessageProps) {
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [tempCaption, setTempCaption] = useState(caption || "");

  const handleCaptionSave = () => {
    onCaptionUpdate?.(tempCaption);
    setIsEditingCaption(false);
  };

  const handleCaptionCancel = () => {
    setTempCaption(caption || "");
    setIsEditingCaption(false);
  };

  {
    /* Image Container */
  }
  return (
    <>
      <div
        className={`relative w-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group ${
          isOwn
            ? "bg-gradient-to-br from-indigo-500 to-purple-600 p-1"
            : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 p-1"
        }`}
        onClick={onImageClick}
      >
        {/* Image */}
        <div className="relative rounded-xl overflow-hidden">
          <ImageWithFallback
            src={imageUrl}
            alt={alt}
            className="w-full h-auto max-h-64 object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
          {/* Image quality indicator */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
              HD
            </div>
          </div>
        </div>

        {/* Caption Section */}
        {(caption || timeStamp) && (
          <div
            className={`p-3 ${
              isOwn
                ? "bg-white/95 dark:bg-slate-900/95"
                : "bg-white/95 dark:bg-slate-800/95"
            }`}
          >
            {isEditingCaption ? (
              <div className="flex items-center gap-2">
                <Input
                  value={tempCaption}
                  onChange={(e) => setTempCaption(e.target.value)}
                  placeholder="Add a caption..."
                  className="h-8 text-xs bg-transparent border-none px-0 focus:ring-0"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCaptionSave();
                    if (e.key === "Escape") handleCaptionCancel();
                  }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCaptionSave();
                  }}
                >
                  <Send className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCaptionCancel();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex justify-between ">
                {/* <div className="flex justify-between border-t border-black"> */}
                <p
                  className={`text-xs leading-relaxed ${
                    isOwn
                      ? "text-slate-700 dark:text-slate-300"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onCaptionUpdate) {
                      setIsEditingCaption(true);
                    }
                  }}
                >
                  {dateStamp}
                  {/* {caption} */}
                </p>
                <p className="text-[10px] ">{timeStamp}</p>
              </div>
            )}
          </div>
        )}
      </div>
      {/* TIme Stamo */}

      {/* TIme Stamo */}
      {/* Add caption button for own messages without caption */}
      {isOwn && !caption && !isEditingCaption && onCaptionUpdate && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute -bottom-8 right-0 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditingCaption(true);
          }}
        >
          Add caption
        </Button>
      )}
    </>
  );
}
// </div>
