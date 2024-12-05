import { useState } from "react";
import { Button } from "./ui/button";
import { Play, Pause, Volume2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface AudioPlayerProps {
  audioUrl: string;
  onLanguageChange: (language: string) => void;
}

export function AudioPlayer({ audioUrl, onLanguageChange }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow border border-gray-200">
      <Button
        variant="outline"
        size="icon"
        onClick={togglePlay}
        className="h-10 w-10"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      <div className="flex-1 flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-gray-500" />
        <div className="h-2 bg-gray-200 rounded-full flex-1">
          <div className="h-full w-1/3 bg-blue-500 rounded-full" />
        </div>
      </div>

      <Select onValueChange={onLanguageChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ja">日本語</SelectItem>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="zh">中文</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}