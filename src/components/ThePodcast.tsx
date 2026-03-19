import React from 'react';
import { Play, Clock, Share2, Trash2, Upload } from 'lucide-react';
import { motion } from 'motion/react';

interface ThePodcastProps {
  id: number;
  title: string;
  duration: string;
  image: string;
  onClick?: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  onImageChange?: (newImageUrl: string) => void;
}

export default function ThePodcast({ id, title, duration, image, onClick, onDelete, onImageChange }: ThePodcastProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onImageChange?.(url);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="group bg-[var(--glass-bg)] border border-[var(--border-main)] rounded-2xl p-4 transition-all duration-300 hover:bg-[var(--border-main)] cursor-pointer relative"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 text-black rounded-full flex items-center justify-center shadow-xl"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Play className="w-6 h-6 fill-current ml-1" />
          </motion.button>
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="p-2 bg-black/40 backdrop-blur-md rounded-lg text-white/60 hover:text-white transition-colors"
            title="Đổi ảnh"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload}
            onClick={(e) => e.stopPropagation()}
          />
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(e);
            }}
            className="p-2 bg-black/40 backdrop-blur-md rounded-lg text-white/60 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-black/40 backdrop-blur-md rounded-lg text-white/60 hover:text-white transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h3 className="font-bold text-lg mb-1 line-clamp-1 transition-colors" style={{ color: 'var(--text-main)' }}>
        <span className="group-hover:text-[var(--primary)] transition-colors">{title}</span>
      </h3>
      
      <div className="flex items-center gap-3 text-[var(--text-muted)] text-sm">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{duration}</span>
        </div>
        <span>•</span>
        <span>Tập {id}</span>
      </div>
    </motion.div>
  );
}
