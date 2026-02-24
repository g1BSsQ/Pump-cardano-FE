"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  file: File | undefined;
  previewUrl: string;
  onFileSelect: (file: File) => void;
  onRemoveFile: () => void;
}

export const ImageUpload = ({ file, previewUrl, onFileSelect, onRemoveFile }: ImageUploadProps) => {
  return (
    <div className="space-y-2">
      <Label>Token Image *</Label>
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        {!previewUrl ? (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG, GIF up to 5MB
              </p>
              <p className="text-xs text-primary mt-1 font-medium">
                Recommended: 256×256px PNG with transparent background
              </p>
            </label>
          </>
        ) : (
          <div className="space-y-4">
            <div className="relative inline-block">
              <Image
                src={previewUrl}
                alt="Token preview"
                width={256}
                height={256}
                className="w-64 h-64 mx-auto rounded-lg object-cover border-2 shadow-xl"
              />
              <button
                onClick={onRemoveFile}
                className="absolute -top-3 -right-3 bg-destructive text-destructive-foreground rounded-full p-1.5 hover:bg-destructive/80 transition-colors shadow-lg"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-primary">
                Selected: {file?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(file?.size && (file.size / 1024 / 1024).toFixed(2))} MB
              </p>
              <div className="flex gap-2 justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
                  className="hidden"
                  id="file-reupload"
                />
                <label htmlFor="file-reupload">
                  <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                    <span>Change Image</span>
                  </Button>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};