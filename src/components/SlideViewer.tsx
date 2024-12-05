import { useState } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideViewerProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  imageUrl: string;
}

export function SlideViewer({ currentPage, totalPages, onPageChange, imageUrl }: SlideViewerProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePageChange = (direction: "prev" | "next") => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newPage = direction === "prev" ? currentPage - 1 : currentPage + 1;
    
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="relative w-full aspect-[4/3] bg-slide-background rounded-lg shadow-lg border border-slide-border overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={imageUrl}
          alt={`Slide ${currentPage}`}
          className={cn(
            "max-w-full max-h-full object-contain",
            isAnimating && "animate-slide-in"
          )}
        />
      </div>
      
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 bg-gradient-to-t from-black/20 to-transparent">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange("prev")}
          disabled={currentPage === 1 || isAnimating}
          className="bg-white/90 hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-white font-medium">
          {currentPage} / {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange("next")}
          disabled={currentPage === totalPages || isAnimating}
          className="bg-white/90 hover:bg-white"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}