import React, { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Dialog, DialogContent } from "./dialog";
import {
  X,
  Send,
  Smile,
  RotateCw,
  Crop,
  Palette,
  Type,
  Check,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ImageCropper } from "./ImageCropper";
import useChatStore from "@store/ChatStore";

interface ImagePreviewBeforeSendProps {
  open: boolean;
  imageUrl: string;
  onSend: (imageUrl: string, caption?: string) => void;
  onCancel: () => void;
  fileName?: string;
}

export function ImagePreviewBeforeSend({
  open,
  imageUrl,
  onSend,
  onCancel,
  fileName,
}: ImagePreviewBeforeSendProps) {
  const { imagePreviewBeforeSending, setImagePreviewBeforeSending } =
    useChatStore();
  const [caption, setCaption] = useState("");
  const [isCropping, setIsCropping] = useState(false);
  const [rotation, setRotation] = useState(0);

  const { setSendImage } = useChatStore();

  const handleSendImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSendImage(true);
    setImagePreviewBeforeSending(false);

    // setviewImageContainer(false);
  };

  const handleSend = () => {
    onSend(imageUrl, caption.trim() || undefined);
    setCaption("");
    setIsCropping(false);
    setRotation(0);
  };

  const handleClose = () => {
    setImagePreviewBeforeSending(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const applyCrop = () => {
    // In a real implementation, you would apply the crop to the image
    // For now, we'll just exit crop mode
    setIsCropping(false);
  };

  return (
    <Dialog
      open={imagePreviewBeforeSending}
      onOpenChange={setImagePreviewBeforeSending}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/95 border-white/10 overflow-hidden">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Top toolbar */}
          <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm border-b border-white/10">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/10"
                onClick={handleClose}
              >
                <X className="h-6 w-6" />
              </Button>
              {fileName && (
                <span className="text-white text-sm font-medium truncate max-w-48">
                  {fileName}
                </span>
              )}
            </div>

            {/* Editing tools */}
            <div className="flex items-center gap-2">
              <Button
                variant={isCropping ? "default" : "ghost"}
                size="icon"
                className={`h-10 w-10 ${
                  isCropping
                    ? "bg-green-600 hover:bg-green-700"
                    : "text-white hover:bg-white/10"
                }`}
                onClick={() => setIsCropping(!isCropping)}
                title="Crop"
              >
                <Crop className="h-5 w-5" />
              </Button>

              {isCropping && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-green-400 hover:bg-white/10"
                  onClick={applyCrop}
                  title="Apply crop"
                >
                  <Check className="h-5 w-5" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/10"
                onClick={handleRotate}
                title="Rotate"
              >
                <RotateCw className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/10"
                title="Draw"
              >
                <Palette className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/10"
                title="Add text"
              >
                <Type className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main image area */}
          <div className="flex-1 flex items-center justify-center p-6 bg-black/50 min-h-0">
            <div className="relative max-w-full max-h-full">
              {isCropping ? (
                <ImageCropper
                  imageUrl={imageUrl}
                  rotation={rotation}
                  className="max-w-full max-h-[50vh] rounded-lg shadow-2xl"
                  onCropChange={(cropArea) => {
                    // Handle crop area change if needed
                    console.log("Crop area:", cropArea);
                  }}
                />
              ) : (
                <ImageWithFallback
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-2xl"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: "transform 0.3s ease",
                  }}
                />
              )}
            </div>
          </div>

          {/* Bottom input area */}
          <div className="p-4 bg-black/80 backdrop-blur-sm border-t border-white/10">
            <div className="flex items-end gap-3 max-w-2xl mx-auto">
              {/* Caption input */}
              <div className="flex-1 relative">
                <Input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Caption (optional)"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-3xl pr-12 py-3 focus:bg-white/20 focus:border-white/40 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>

              {/* Send button */}
              <Button
                onClick={handleSendImage}
                className="h-12 w-12 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg flex-shrink-0"
                size="icon"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
