import { useState } from "react";
import { SlideViewer } from "@/components/SlideViewer";
import { AudioPlayer } from "@/components/AudioPlayer";

const Index = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10; // This will come from your PDF file
  const placeholderImage = "/placeholder.svg"; // Using the placeholder image

  const handleLanguageChange = (language: string) => {
    console.log("Language changed to:", language);
    // Here you'll implement the logic to change the audio file
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">PDF Slideshow</h1>
        
        <div className="grid gap-6">
          <SlideViewer
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            imageUrl={placeholderImage}
          />
          
          <AudioPlayer
            audioUrl=""
            onLanguageChange={handleLanguageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;