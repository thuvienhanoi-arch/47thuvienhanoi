import React, { useState, useEffect } from 'react';
import ThanhBen from './components/ThanhBen';
import TrinhPhat from './components/TrinhPhat';
import Podcast from './pages/Podcast';
import ChatAI from './pages/ChatAI';
import TomTatSach from './pages/TomTatSach';
import CodeFixer from './pages/CodeFixer';
import Auth from './pages/Auth';
import { ChevronUp } from 'lucide-react';
import FloatingBackHome from './components/FloatingBackHome';
import BackHomeButton from './components/BackHomeButton';

export default function App() {
  const [tab, setTab] = useState('podcast');
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [primaryColor, setPrimaryColor] = useState('#f59e0b');
  const [podcasts, setPodcasts] = useState([
    { id: 1, title: "Tương lai của AI trong giáo dục", duration: "15:30", image: "https://picsum.photos/seed/ai1/400/400", type: 'audio' as const, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 2, title: "Hà Nội 36 phố phường - Thạch Lam", duration: "22:45", image: "https://picsum.photos/seed/hanoi/400/400", type: 'audio' as const, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 3, title: "Video Podcast: AI & Nghệ thuật", duration: "10:20", image: "https://picsum.photos/seed/ai3/400/400", type: 'video' as const, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    { id: 4, title: "Khám phá vũ trụ cùng AI", duration: "30:15", image: "https://picsum.photos/seed/space/400/400", type: 'audio' as const, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: 5, title: "Lịch sử văn minh nhân loại", duration: "45:00", image: "https://picsum.photos/seed/history/400/400", type: 'audio' as const, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { id: 6, title: "Sức mạnh của thói quen", duration: "12:10", image: "https://picsum.photos/seed/habit/400/400", type: 'audio' as const, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  ]);
  const [currentMedia, setCurrentMedia] = useState<{
    id?: number;
    title: string;
    url: string;
    type: 'audio' | 'video';
    image?: string;
    author?: string;
  } | null>(null);

  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNext = () => {
    if (!currentMedia || !currentMedia.id) return;
    const currentIndex = podcasts.findIndex(p => p.id === currentMedia.id);
    const nextIndex = (currentIndex + 1) % podcasts.length;
    const nextMedia = podcasts[nextIndex];
    setCurrentMedia({
      id: nextMedia.id,
      title: nextMedia.title,
      url: nextMedia.url,
      type: nextMedia.type,
      image: nextMedia.image
    });
  };

  const handleDelete = (id: number) => {
    setPodcasts(podcasts.filter(p => p.id !== id));
  };

  const handleImageChange = (id: number, newImageUrl: string) => {
    setPodcasts(podcasts.map(p => p.id === id ? { ...p, image: newImageUrl } : p));
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  if (!token) {
    return (
      <div 
        className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'dark' : 'light'}`}
        style={{ 
          '--primary': primaryColor,
          color: 'var(--text-main)',
          backgroundColor: 'var(--bg-main)'
        } as React.CSSProperties}
      >
        <Auth onLogin={setToken} />
      </div>
    );
  }

  return (
    <div 
      className={`flex min-h-screen font-sans selection:bg-accent-primary/30 transition-colors duration-300 ${isDarkMode ? 'dark' : 'light'}`}
      style={{ 
        '--primary': primaryColor,
        color: 'var(--text-main)',
        backgroundColor: 'var(--bg-main)'
      } as React.CSSProperties}
    >
      {/* Sidebar */}
      <ThanhBen 
        activeTab={tab} 
        setTab={setTab} 
        onLogout={() => setToken(null)} 
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        primaryColor={primaryColor}
        setPrimaryColor={setPrimaryColor}
      />

      {/* Main Content */}
      <main className="flex-1 ml-64 pb-32 min-h-screen relative">
        {/* Background Decorative Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10">
          {tab === 'podcast' && (
            <Podcast 
              onPlay={setCurrentMedia} 
              podcasts={podcasts} 
              setPodcasts={setPodcasts}
              onDelete={handleDelete}
              onImageChange={handleImageChange}
            />
          )}
          {tab === 'chat' && <ChatAI />}
          {tab === 'tomtat' && <TomTatSach />}
          {tab === 'codefixer' && <CodeFixer />}
        </div>
      </main>

      {/* Player */}
      <TrinhPhat 
        currentMedia={currentMedia} 
        setCurrentMedia={setCurrentMedia} 
        onNext={handleNext}
      />

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`scrollTop fixed bottom-32 right-8 p-4 bg-[var(--primary)] text-black rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all z-50 flex items-center justify-center ${showScroll ? 'show' : ''}`}
        style={{ opacity: showScroll ? 0.8 : 0 }}
      >
        <ChevronUp className="w-6 h-6" />
      </button>

      <FloatingBackHome />
      <BackHomeButton />
    </div>
  );
}
