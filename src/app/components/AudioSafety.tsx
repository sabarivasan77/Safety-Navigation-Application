import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';

export function AudioSafety() {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    
    // Use Web Speech API for text-to-speech
    const utterance = new SpeechSynthesisUtterance('Are you safe? Please confirm your status.');
    utterance.lang = 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onend = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <Button
      onClick={isPlaying ? handleStop : handlePlay}
      className={`h-12 ${
        isPlaying
          ? 'bg-orange-500 hover:bg-orange-600'
          : 'bg-green-600 hover:bg-green-700'
      }`}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-5 h-5 mr-2" />
          Stop Audio
        </>
      ) : (
        <>
          <Volume2 className="w-5 h-5 mr-2" />
          Safety Check
        </>
      )}
    </Button>
  );
}
