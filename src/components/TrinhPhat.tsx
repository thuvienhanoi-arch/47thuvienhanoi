import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface TrinhPhatProps {
  currentMedia: { title: string; url: string; type: 'audio' | 'video'; image?: string; author?: string } | null;
  setCurrentMedia: (media: any) => void;
  onNext?: () => void;
}

export default function TrinhPhat({ currentMedia, setCurrentMedia, onNext }: TrinhPhatProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [showVideo, setShowVideo] = useState(false);
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);

  useEffect(() => {
    if (currentMedia) {
      setIsPlaying(true);
      setIsLiked(false); // Reset like for new media
      if (mediaRef.current) {
        mediaRef.current.play().catch(() => {});
        mediaRef.current.volume = volume;
      }
      if (currentMedia.type === 'video') {
        setShowVideo(true);
      }
    }
  }, [currentMedia]);

  const togglePlay = () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (mediaRef.current) {
      mediaRef.current.volume = v;
    }
  };

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const updateProgress = () => {
      const p = (media.currentTime / media.duration) * 100;
      setProgress(p || 0);
      // Log current time as requested
      console.log('Current Time:', media.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onNext) {
        onNext();
      }
    };

    media.addEventListener('timeupdate', updateProgress);
    media.addEventListener('ended', handleEnded);
    return () => {
      media.removeEventListener('timeupdate', updateProgress);
      media.removeEventListener('ended', handleEnded);
    };
  }, [currentMedia, onNext]);

  if (!currentMedia) return null;

  return (
    <>
      {/* Video Modal */}
      {showVideo && currentMedia.type === 'video' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-8">
          <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <video 
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={currentMedia.url}
              className="w-full h-full object-cover"
              autoPlay
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={onNext}
            />
            <button 
              onClick={() => setShowVideo(false)}
              className="absolute top-6 right-6 p-3 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
            >
              <Maximize2 className="w-6 h-6 rotate-45" />
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-64 right-0 h-28 bg-[var(--bg-main)]/80 backdrop-blur-3xl border-t border-[var(--border-main)] flex items-center justify-between px-12 z-50 transition-all duration-500 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        {currentMedia.type === 'audio' ? (
          <audio 
            ref={mediaRef as React.RefObject<HTMLAudioElement>} 
            src={currentMedia.url} 
            autoPlay 
            onEnded={onNext}
          />
        ) : (
          !showVideo && (
            <video 
              ref={mediaRef as React.RefObject<HTMLVideoElement>} 
              src={currentMedia.url} 
              className="hidden" 
              onEnded={onNext}
            />
          )
        )}
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--border-main)] cursor-pointer group">
          <motion.div 
            className="h-full relative shadow-[0_0_20px_rgba(245,158,11,0.8)]"
            style={{ width: `${progress}%`, backgroundColor: 'var(--primary)' }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-xl scale-0 group-hover:scale-100 transition-transform" />
          </motion.div>
        </div>

        <div className="flex items-center gap-6 w-1/3">
          <div className="w-16 h-16 bg-[var(--glass-bg)] rounded-2xl overflow-hidden border border-[var(--border-main)] group relative cursor-pointer shadow-2xl">
            <img 
              src={currentMedia.image || "https://picsum.photos/seed/podcast/200/200"} 
              alt="Cover" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div 
              onClick={() => currentMedia.type === 'video' && setShowVideo(true)}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Maximize2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-lg line-clamp-1 tracking-tight" style={{ color: 'var(--text-main)' }}>{currentMedia.title}</h4>
            <p className="text-[var(--text-muted)] text-sm font-medium mt-0.5">{currentMedia.author || 'Thư viện Hà Nội'}</p>
          </div>
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={`ml-2 p-3 rounded-full transition-all ${isLiked ? 'text-red-500 scale-125' : 'text-[var(--text-muted)] hover:text-red-400 hover:bg-white/5'}`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 w-1/3">
          <div className="flex items-center gap-8">
            <button className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all hover:scale-110 active:scale-90">
              <SkipBack className="w-6 h-6 fill-current" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
            </button>
            <button 
              onClick={onNext}
              className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all hover:scale-110 active:scale-90"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
          </div>

          {/* Visualizer bars */}
          <div className="flex items-end gap-1 h-6">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  height: isPlaying ? [4, 24, 8, 18, 4] : 4 
                }}
                transition={{ 
                  duration: 0.6, 
                  repeat: Infinity, 
                  delay: i * 0.03,
                  ease: "easeInOut"
                }}
                className="w-1 rounded-full"
                style={{ backgroundColor: 'var(--primary)', opacity: 0.4 }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-6 w-1/3">
          <div className="flex items-center gap-3 group">
            <Volume2 className="w-6 h-6 text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors" />
            <div className="w-32 h-1.5 bg-[var(--border-main)] rounded-full overflow-hidden relative">
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={handleVolumeChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div 
                className="h-full bg-[var(--primary)] transition-all" 
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
