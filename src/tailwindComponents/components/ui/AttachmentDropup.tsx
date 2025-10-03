import React, { useState } from "react";
import { Button } from "./button";
import imageCompression from "browser-image-compression";
import {
  Paperclip,
  Image,
  FileText,
  Camera,
  Music,
  MapPin,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { toast } from "sonner";
import useChatModulesStore from "@store/ChatModulesStore";
import useChatStore from "@store/ChatStore";
import useAppStore from "@store/AppStore";

interface AttachmentDropupProps {
  onImageSelect?: (imageUrl: string) => void;
  className?: string;
}

export function AttachmentDropup({
  onImageSelect,
  className,
}: AttachmentDropupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { dark, setShowDarkAndLightModeDropDown } = useAppStore();
  const {
    setviewImageContainer,
    setViewImage,
    setShowWait,
    viewImageContainer,

    showWait,
    setImageUrl,
  } = useChatModulesStore();
  // const { emailAddress, name } = AuthStore();
  const {
    setHeIsTyping,
    setTyping,
    setMessages,
    setLastMessageInfo,
    sendImage,
    setSendImage,
    uploadedImageDimensions,
    setUploadedImageDimensions,
    setUserSelectedImage,
    setImagePreviewBeforeSending,
    userSelectedImage,
    // selectedChat,
  } = useChatStore();

  const handleDocumentUpload = () => {
    toast.info("📄 Document upload coming soon!");
    setIsOpen(false);
  };

  const handleCameraCapture = () => {
    toast.info("📷 Camera capture coming soon!");
    setIsOpen(false);
  };

  const handleAudioUpload = () => {
    toast.info("🎵 Audio upload coming soon!");
    setIsOpen(false);
  };

  const handleLocationShare = () => {
    toast.info("📍 Location sharing coming soon!");
    setIsOpen(false);
  };

  // *******************************************************************************************************************************************Helper Functions only for image processing
  // Main image upload handler - shows image instantly
  const handleImageSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("hello from image submit");
    setviewImageContainer(true);
    setShowWait(true);
    setViewImage(false);

    const fileData = e.target.files?.[0];
    if (!fileData) return;

    try {
      // Step 1: Create instant preview using object URL (0ms delay)
      const objectURL = URL.createObjectURL(fileData);

      // Step 2: Get dimensions immediately from file
      const dimensions = await getImageDimensionsFromFile(fileData);
      setUploadedImageDimensions(dimensions);

      // Step 3: Set preview immediately - user sees image NOW!
      setUserSelectedImage(objectURL); // For instant display
      setImagePreviewBeforeSending(true);
      // DON'T set imageUrl yet - we need data URL for database
      setShowWait(false); // Loading stops here - user happy!
      console.log("Image displayed instantly");

      // Step 4: Convert to data URL for database storage (in background)
      convertToDataUrlForDatabase(fileData, objectURL);
    } catch (error: any) {
      console.error("Image processing error:", error?.message || error);
      alert("❌ Failed to process image. Please try again.");
      setShowWait(false);
      setviewImageContainer(false);
    }
  };

  // Get image dimensions directly from file (faster than data URL)
  const getImageDimensionsFromFile = (
    file: File
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src); // Clean up memory immediately
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Failed to load image"));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Convert to data URL for database storage (happens in background)
  const convertToDataUrlForDatabase = async (file: File, objectURL: string) => {
    const maxSizeInBytes = 1 * 1024 * 1024; // 1MB

    try {
      let finalFile = file;

      // Compress first if file is too large
      if (file.size > maxSizeInBytes) {
        console.log("Compressing for database storage...");
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: file.type,
          initialQuality: 0.8,
          alwaysKeepResolution: false,
        };

        finalFile = await imageCompression(file, options);
      }

      // Convert to data URL for database
      const dataURL = await fileToDataURL(finalFile);

      // Now set the imageUrl for database storage
      setImageUrl(dataURL); // This is what goes to your database

      console.log("Data URL ready for database");
    } catch (error) {
      console.warn("Failed to create data URL, using original:", error);
      // Fallback: convert original file to data URL
      try {
        const fallbackDataURL = await fileToDataURL(file);
        setImageUrl(fallbackDataURL);
      } catch (fallbackError) {
        console.error("Complete failure to create data URL:", fallbackError);
      }
    }
  };

  // Helper function to convert file to data URL
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (result && typeof result === "string") {
          resolve(result);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(new Error("FileReader error"));
      reader.readAsDataURL(file);
    });
  };

  // Optional: Memory cleanup function
  // Call this in your component's useEffect cleanup
  const cleanupImageUrls = (imageUrl: string) => {
    if (imageUrl && imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }
  };

  // *******************************************************************************************************************************************Helper Functions only for image processing
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-10 w-10 rounded-xl hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-200 ${className}`}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="center"
        sideOffset={8}
        className="w-64 glass-morphism border-white/20 dark:border-slate-700/30 shadow-xl"
      >
        <div className="grid grid-cols-3 gap-2 p-3 bg-white">
          {/* Image Upload */}
          <label
            className="cursor-pointer inline-block relative"
            htmlFor="imageUpload"
          >
            <DropdownMenuItem
              className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/30 dark:hover:bg-slate-700/30 cursor-pointer transition-colors duration-200"
              // onClick={handleImageSubmit}
              onSelect={(e) => {
                e.preventDefault(); // stop dropdown from closing instantly
                // document.getElementById("imageUpload")?.click(); // trigger hidden input
              }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                <input
                  id="imageUpload"
                  name="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSubmit}
                  //   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  className="hidden"
                />
                <Image className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-medium text-center">Gallery</span>
            </DropdownMenuItem>
          </label>

          {/* Camera */}
          <DropdownMenuItem
            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/30 dark:hover:bg-slate-700/30 cursor-pointer transition-colors duration-200"
            onClick={handleCameraCapture}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-medium text-center">Camera</span>
          </DropdownMenuItem>

          {/* Document */}
          <DropdownMenuItem
            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/30 dark:hover:bg-slate-700/30 cursor-pointer transition-colors duration-200"
            onClick={handleDocumentUpload}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-medium text-center">Document</span>
          </DropdownMenuItem>

          {/* Audio */}
          <DropdownMenuItem
            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/30 dark:hover:bg-slate-700/30 cursor-pointer transition-colors duration-200"
            onClick={handleAudioUpload}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <Music className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-medium text-center">Audio</span>
          </DropdownMenuItem>

          {/* Location */}
          <DropdownMenuItem
            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/30 dark:hover:bg-slate-700/30 cursor-pointer transition-colors duration-200"
            onClick={handleLocationShare}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-medium text-center">Location</span>
          </DropdownMenuItem>

          {/* Empty space for symmetry */}
          <div className="w-12 h-12" />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
