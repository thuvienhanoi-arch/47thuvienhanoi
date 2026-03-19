import React, { useState, useRef } from 'react';
import ThePodcast from '../components/ThePodcast';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, TrendingUp, Upload, X, Music, CheckCircle2, Loader2, RotateCcw, Play } from 'lucide-react';
import GenerateProgress from '../components/GenerateProgress';

interface PodcastProps {
  onPlay?: (media: { title: string; url: string; type: 'audio' | 'video'; image?: string; author?: string }) => void;
  podcasts: any[];
  setPodcasts: (podcasts: any[]) => void;
  onDelete: (id: number) => void;
  onImageChange: (id: number, newImageUrl: string) => void;
}

export default function Podcast({ onPlay, podcasts, setPodcasts, onDelete, onImageChange }: PodcastProps) {
  const [banner, setBanner] = useState<string>("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&h=600&auto=format&fit=crop");
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const uploadBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setBanner(url);
  };

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingPodcast, setIsCreatingPodcast] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [newPodcast, setNewPodcast] = useState({
    title: '',
    duration: '00:00',
    image: `https://picsum.photos/seed/${Math.random()}/400/400`
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Vui lòng chọn tệp âm thanh!");
      return;
    }
    setIsUploading(true);
    setIsCreatingPodcast(true);
    
    try {
      const res = await fetch('/api/podcast/tao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noiDung: newPodcast.title }),
      });

      if (!res.ok) throw new Error('Lỗi khi tạo podcast');

      const data = await res.json();
      
      // Use the first episode from the API response
      const podcastToAdd = {
        id: podcasts.length + 1,
        title: data.tap[0].tieuDe + ": " + newPodcast.title,
        duration: data.tap[0].thoiLuong,
        image: newPodcast.image,
        type: 'audio' as const,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      };

      setPodcasts([podcastToAdd, ...podcasts]);
      setUploadSuccess(true);
      
      // Reset after success
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadSuccess(false);
        setSelectedFile(null);
        setNewPodcast({
          title: '',
          duration: '00:00',
          image: `https://picsum.photos/seed/${Math.random()}/400/400`
        });
      }, 1500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setPodcasts([
      { id: 1, title: "Tương lai của AI trong giáo dục", duration: "15:30", image: "https://picsum.photos/seed/ai1/400/400", type: 'audio' as const, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: 2, title: "Hà Nội 36 phố phường - Thạch Lam", duration: "22:45", image: "https://picsum.photos/seed/hanoi/400/400", type: 'audio' as const, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
      { id: 3, title: "Video Podcast: AI & Nghệ thuật", duration: "10:20", image: "https://picsum.photos/seed/ai3/400/400", type: 'video' as const, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { id: 4, title: "Khám phá vũ trụ cùng AI", duration: "30:15", image: "https://picsum.photos/seed/space/400/400", type: 'audio' as const, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
      { id: 5, title: "Lịch sử văn minh nhân loại", duration: "45:00", image: "https://picsum.photos/seed/history/400/400", type: 'audio' as const, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
      { id: 6, title: "Sức mạnh của thói quen", duration: "12:10", image: "https://picsum.photos/seed/habit/400/400", type: 'audio' as const, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-8">
      {/* Dynamic Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-[500px] rounded-[40px] overflow-hidden mb-16 group shadow-2xl"
      >
        {banner ? (
          <img src={banner} alt="Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full bg-[var(--glass-bg)] border-2 border-dashed border-[var(--border-main)] flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <Music className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <span className="text-2xl font-bold text-[var(--text-muted)]">🎙 Ảnh podcast nổi bật</span>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        <label className="absolute bottom-6 right-6 px-6 py-3 bg-[var(--primary)] text-black font-bold rounded-full cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all z-10 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          <span>Tải ảnh Banner</span>
          <input type="file" accept="image/*" onChange={uploadBanner} hidden />
        </label>

        <div className="absolute bottom-12 left-12 z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-4xl">🎧</span>
            </div>
            <h2 className="text-7xl font-black text-white tracking-tight">Podcast Đặc Sắc</h2>
          </div>
          <p className="text-white/80 text-2xl font-medium mb-8 max-w-2xl">Khám phá những câu chuyện truyền cảm hứng nhất hôm nay qua công nghệ AI đỉnh cao.</p>
          <button 
            onClick={() => podcasts[0] && onPlay?.({
              title: podcasts[0].title,
              url: podcasts[0].url,
              type: podcasts[0].type,
              image: podcasts[0].image
            })}
            className="px-12 py-5 bg-white text-black text-xl font-bold rounded-full hover:bg-[var(--primary)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-2xl"
          >
            <Play className="w-7 h-7 fill-current" />
            <span>Nghe ngay</span>
          </button>
        </div>
      </motion.div>

      <div className="flex items-center justify-between mb-12">
        <div>
          <div className="flex items-center gap-2 text-[var(--primary)] mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Khám phá mới</span>
          </div>
          <h1 className="text-4xl font-black text-[var(--text-main)]">Thư viện Podcast AI</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--glass-bg)] border border-[var(--border-main)] text-[var(--text-main)] font-bold rounded-full transition-all hover:bg-[var(--border-main)] active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Đặt lại</span>
          </button>
          
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 text-black font-bold rounded-full transition-all shadow-lg active:scale-95"
            style={{ backgroundColor: 'var(--primary)', boxShadow: '0 10px 20px var(--primary)33' }}
          >
            <Upload className="w-5 h-5" />
            <span>Tải lên Podcast</span>
          </button>
          
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/60">Xu hướng tuần này</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[var(--bg-main)] border border-[var(--border-main)] rounded-3xl p-8 w-full max-w-lg relative overflow-hidden"
            >
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16" style={{ backgroundColor: 'var(--primary)', opacity: 0.1 }} />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary)', opacity: 0.2 }}>
                    <Music className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                  </div>
                  <h2 className="text-2xl font-black text-[var(--text-main)]">Tải lên Podcast mới</h2>
                </div>
                <button 
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white/40" />
                </button>
              </div>

              {uploadSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-12 flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Tải lên thành công!</h3>
                  <p className="text-white/60">Podcast của bạn đã được thêm vào thư viện.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleUpload} className="space-y-6 relative z-10">
                  {isUploading && (
                    <div className="mb-6">
                      <GenerateProgress 
                        isRunning={isCreatingPodcast} 
                        label="Đang xử lý âm thanh và tạo Podcast..." 
                        onComplete={() => setIsCreatingPodcast(false)}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">Tên Podcast</label>
                    <input 
                      required
                      type="text" 
                      placeholder="VD: Bí mật của thành công..."
                      className="w-full bg-[var(--glass-bg)] border border-[var(--border-main)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none transition-colors"
                      style={{ borderColor: 'var(--border-main)' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-main)'}
                      value={newPodcast.title}
                      onChange={(e) => setNewPodcast({...newPodcast, title: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white/40 uppercase tracking-widest">Thời lượng</label>
                      <input 
                        required
                        type="text" 
                        placeholder="VD: 15:30"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                        value={newPodcast.duration}
                        onChange={(e) => setNewPodcast({...newPodcast, duration: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white/40 uppercase tracking-widest">Tập số</label>
                      <input 
                        disabled
                        type="text" 
                        value={podcasts.length + 1}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/40 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/40 uppercase tracking-widest">Tệp âm thanh</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full aspect-[16/5] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group ${
                        selectedFile 
                          ? 'border-emerald-500/50 bg-emerald-500/5' 
                          : 'border-white/10 hover:border-amber-500/50 hover:bg-amber-500/5'
                      }`}
                    >
                      {selectedFile ? (
                        <>
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                          <span className="text-sm text-white font-medium px-4 text-center line-clamp-1">
                            {selectedFile.name}
                          </span>
                          <span className="text-xs text-white/40">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-white/20 group-hover:text-amber-500 transition-colors" />
                          <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors">Chọn tệp MP3 hoặc WAV</span>
                        </>
                      )}
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="audio/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  <button 
                    disabled={isUploading}
                    type="submit"
                    className="w-full py-4 text-black font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <span>Hoàn tất tải lên</span>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {podcasts.map((p) => (
          <ThePodcast 
            key={p.id} 
            {...p} 
            onClick={() => onPlay?.({
              title: p.title,
              url: p.url,
              type: p.type,
              image: p.image
            })}
            onDelete={() => onDelete(p.id)}
            onImageChange={(newUrl) => onImageChange(p.id, newUrl)}
          />
        ))}
      </div>
    </div>
  );
}
