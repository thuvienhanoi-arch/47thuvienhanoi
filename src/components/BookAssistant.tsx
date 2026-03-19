import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Upload, 
  Mic, 
  Loader2, 
  Play, 
  Pause, 
  Download,
  Sparkles,
  Search,
  Lightbulb,
  FileText,
  Copy,
  RefreshCw,
  FileDown,
  Video,
  Check,
  Image as ImageIcon,
  Maximize2,
  X,
  Zap,
  Shield,
  MessageSquare,
  Volume2,
  ChevronRight,
  Settings2,
  Share2,
  FileJson,
  Facebook,
  Clock
} from 'lucide-react';
import GenerateProgress from './GenerateProgress';
import { RunnerScene } from './RunnerScene';
import { 
  analyzeBook, 
  generateSpeech, 
  generatePodcastCovers, 
  performDeepAnalysis,
  generateMultiSpeakerSpeech,
  generateFacebookPost,
  BookAnalysis, 
  AnalysisMode,
  DeepAnalysisMode,
  AnalysisStyle,
  AudioOverviewConfig,
  AudioOverviewLanguage,
  AudioOverviewLength,
  VoiceType,
  FacebookPostStyle,
  generateCustomAudioOverview,
  generateFullPodcastStudio,
  PodcastPart,
  chatWithAI,
  generatePodcastSeries,
  PodcastSeries,
  PodcastEpisode
} from '../services/aiService';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TypewriterText = ({ text, speed = 5 }: { text: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-white/70"><Markdown>{displayedText}</Markdown></div>;
};

const StarBackground = () => {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: string; duration: string }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      duration: `${Math.random() * 3 + 2}s`
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="stars-container">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            '--duration': star.duration
          } as any}
        />
      ))}
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className="glass-ui p-8 space-y-6 flex flex-col min-h-[400px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 skeleton" />
            <div className="h-6 w-32 skeleton" />
          </div>
          <div className="w-4 h-4 skeleton" />
        </div>
        <div className="space-y-4 flex-1">
          <div className="h-4 w-full skeleton" />
          <div className="h-4 w-5/6 skeleton" />
          <div className="h-4 w-4/6 skeleton" />
          <div className="h-4 w-full skeleton" />
          <div className="h-4 w-3/4 skeleton" />
        </div>
      </div>
    ))}
  </div>
);

export default function BookAssistant() {
  const [input, setInput] = useState('Phố phường Hà Nội xưa');
  const [image, setImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('AI đang phân tích...');
  const [analysis, setAnalysis] = useState<BookAnalysis | null>({
    title: "Phố phường Hà Nội xưa",
    summary: "Tác phẩm là một tập bút ký đặc sắc của Thạch Lam, khắc họa vẻ đẹp văn hóa, đời sống và đặc biệt là nghệ thuật ẩm thực của Hà Nội những năm đầu thế kỷ 20. Qua ngòi bút tinh tế, nhạy cảm, tác giả đưa người đọc len lỏi vào từng con phố nhỏ, cảm nhận cái hồn cốt của kinh kỳ qua những món quà quê, những phong tục tập quán và lối sống thanh lịch của người Tràng An. Đây không chỉ là một cuốn sách về địa lý hay lịch sử, mà là một bức tranh tâm hồn về một Hà Nội xưa cũ, đầy hoài niệm và trân trọng.",
    keyIdeas: [
      "Hà Nội 36 phố phường: Mỗi con phố mang một nét riêng, một cái tên gắn liền với một nghề thủ công truyền thống.",
      "Văn hóa ẩm thực tinh tế: Thạch Lam dành nhiều tâm huyết viết về các món quà Hà Nội như bún chả, phở, cốm Vòng... coi đó là nghệ thuật và di sản.",
      "Lối sống thanh lịch: Khắc họa cốt cách, tâm hồn người Hà Nội qua những chi tiết đời thường nhưng đầy chất thơ.",
      "Sự biến đổi của thời đại: Những trăn trở về việc bảo tồn nét đẹp truyền thống trước sự xâm nhập của văn hóa mới.",
      "Nghệ thuật bút ký: Ngôn ngữ nhẹ nhàng, giàu hình ảnh và cảm xúc, đặc trưng cho phong cách lãng mạn của Tự Lực Văn Đoàn."
    ],
    podcastScript: "Chào mừng các bạn đến với Podcast AI Book Summary. Hôm nay, chúng ta sẽ cùng ngược dòng thời gian về với 'Phố phường Hà Nội xưa' của nhà văn Thạch Lam.\n\nBạn có bao giờ tự hỏi, Hà Nội của gần một thế kỷ trước trông như thế nào không? Qua giọng văn nhẹ như sương khói của Thạch Lam, Hà Nội hiện lên không phải bằng những con số khô khan, mà bằng hương vị của bát phở nóng hổi bên vỉa hè, bằng tiếng rao đêm xao xác, và bằng cái thanh lịch rất riêng của người dân phố cổ.\n\nThạch Lam không chỉ tả phố, ông tả 'hồn' phố. Ông trân trọng từng món quà quê, coi đó là những 'tinh hoa' của đất trời. Cuốn sách nhắc nhở chúng ta rằng, giữa nhịp sống hối hả hôm nay, vẫn có một Hà Nội thâm trầm, tinh tế cần được nâng niu trong ký ức mỗi người.\n\nHãy cùng lắng nghe và cảm nhận một Hà Nội thật khác, thật xưa qua bản tóm tắt chi tiết này nhé.",
    insights: [
      "Văn hóa không chỉ là những gì to tát, mà nằm trong từng món ăn, từng tiếng rao.",
      "Sự thanh lịch của người Hà Nội là một di sản tinh thần quý giá.",
      "Hoài niệm là cách để chúng ta giữ gìn bản sắc trong thế giới hiện đại."
    ],
    contentIdeas: {
      tiktok: ["Review các món ăn Thạch Lam nhắc tới", "So sánh phố cổ xưa và nay"],
      youtube: ["Hành trình đi tìm hồn cốt Hà Nội qua trang sách", "Phim tài liệu ngắn về 36 phố phường"],
      blog: ["Tại sao Thạch Lam là nhà văn của Hà Nội?", "Nghệ thuật thưởng thức quà Hà Nội"]
    }
  });
  const [covers, setCovers] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const parallaxRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      // Parallax for hero title
      if (parallaxRef.current) {
        const { innerWidth, innerHeight } = window;
        const x = (e.clientX / innerWidth - 0.5) * 2;
        const y = (e.clientY / innerHeight - 0.5) * 2;
        const moveX = x * 20;
        const moveY = y * 20;
        parallaxRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }

      // 3D Rotation for badge
      const x = (e.clientX / window.innerWidth - 0.5);
      const y = (e.clientY / window.innerHeight - 0.5);
      targetX = x * 40;
      targetY = y * 25;

      // Shine effect for badge
      if (badgeRef.current) {
        const rect = badgeRef.current.getBoundingClientRect();
        const shineX = ((e.clientX - rect.left) / rect.width) * 100;
        const shineY = ((e.clientY - rect.top) / rect.height) * 100;
        badgeRef.current.style.setProperty("--x", `${shineX}%`);
        badgeRef.current.style.setProperty("--y", `${shineY}%`);
      }
    };

    const animateBadge = () => {
      if (badgeRef.current) {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        badgeRef.current.style.transform = `
          translateX(-50%)
          rotateX(${-currentY}deg)
          rotateY(${currentX}deg)
        `;
      }
      animationFrameId = requestAnimationFrame(animateBadge);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animateBadge();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const [mode, setMode] = useState<AnalysisMode>("Deep Analysis");
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedCover, setSelectedCover] = useState<string | null>(null);

  // Deep Analysis States
  const [activeDeepMode, setActiveDeepMode] = useState<DeepAnalysisMode>("Deep Exploration");
  const [analysisStyle, setAnalysisStyle] = useState<AnalysisStyle>("Deep");
  const [deepAnalysisResults, setDeepAnalysisResults] = useState<Partial<Record<DeepAnalysisMode, string>>>({});
  const [deepLoading, setDeepLoading] = useState(false);
  const [deepAudioUrls, setDeepAudioUrls] = useState<Partial<Record<DeepAnalysisMode, string>>>({});
  const [deepAudioDurations, setDeepAudioDurations] = useState<Partial<Record<DeepAnalysisMode, number>>>({});
  
  // Custom Audio Overview States
  const [isAudioConfigOpen, setIsAudioConfigOpen] = useState(false);
  const [audioConfig, setAudioConfig] = useState<AudioOverviewConfig>({
    mode: "Deep Exploration",
    language: "Tiếng Việt",
    length: "Default",
    voiceType: "Podcast host",
    hasBackgroundMusic: true,
    customInstruction: ""
  });
  const [customAudioLoading, setCustomAudioLoading] = useState(false);
  const [isGeneratingCovers, setIsGeneratingCovers] = useState(false);

  // Facebook Post States
  const [facebookPost, setFacebookPost] = useState<string | null>(null);
  const [facebookPostStyle, setFacebookPostStyle] = useState<FacebookPostStyle>("Professional");
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Full Podcast Studio States
  const [isFullStudioOpen, setIsFullStudioOpen] = useState(false);
  const [fullPodcastSections, setFullPodcastSections] = useState({
    deep: "",
    summary: "",
    critique: "",
    debate: ""
  });
  const [fullAudioUrl, setFullAudioUrl] = useState<string | null>(null);
  const [isGeneratingFullPodcast, setIsGeneratingFullPodcast] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isCreatingPodcast, setIsCreatingPodcast] = useState(false);
  const [podcastScript, setPodcastScript] = useState<PodcastPart[]>([]);
  const [activeScriptIndex, setActiveScriptIndex] = useState(-1);
  
  // Chat States
  const [chatHistory, setChatHistory] = useState<{ role: string; parts: { text: string }[] }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatAudioUrl, setChatAudioUrl] = useState<string | null>(null);
  const [podcastSeries, setPodcastSeries] = useState<PodcastSeries | null>(null);
  const [isGeneratingSeries, setIsGeneratingSeries] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const backgroundMusicUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; // Placeholder soft music

  useEffect(() => {
    if (isPlaying && audioConfig.hasBackgroundMusic) {
      setIsMusicPlaying(true);
    } else {
      setIsMusicPlaying(false);
    }
  }, [isPlaying, audioConfig.hasBackgroundMusic]);

  useEffect(() => {
    if (musicRef.current) {
      if (isMusicPlaying) {
        musicRef.current.volume = 0.1;
        musicRef.current.play().catch(() => {});
      } else {
        musicRef.current.pause();
      }
    }
  }, [isMusicPlaying]);

  useEffect(() => {
    if (loading) {
      const texts = ['AI đang phân tích...', 'Đang trích xuất ý tưởng...', 'Đang tạo kịch bản podcast...', 'Đang thiết kế ảnh bìa...'];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingText(texts[i % texts.length]);
        i++;
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(',')[1];
        setImage({ data: base64Data, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setImage({
          data: base64.split(',')[1],
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleProcess = async () => {
    if (!input && !image) return;
    setLoading(true);
    setAnalysis(null);
    setCovers([]);
    setAudioUrl(null);
    setDeepAnalysisResults({});
    setDeepAudioUrls({});
    
    try {
      const result = await analyzeBook(image || input, mode);
      setAnalysis(result);
      
      try {
        const audio = await generateSpeech(result.podcastScript);
        setAudioUrl(audio);
      } catch (audioErr: any) {
        console.error("Audio generation error:", audioErr);
        setError(audioErr.message || "Failed to generate podcast audio.");
      }
      
      handleDeepAnalysis("Deep Exploration", analysisStyle);
    } catch (error: any) {
      console.error("Error processing book:", error);
      setError(error.message || "An error occurred while analyzing the book.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCovers = async () => {
    if (!analysis) return;
    setIsGeneratingCovers(true);
    try {
      const coverImages = await generatePodcastCovers(analysis.title);
      setCovers(coverImages);
    } catch (error) {
      console.error("Error generating covers:", error);
    } finally {
      setIsGeneratingCovers(false);
    }
  };

  const handleGenerateModeAudio = async (mode: DeepAnalysisMode) => {
    if (!deepAnalysisResults[mode]) return;
    setLoading(true);
    setLoadingText(`Đang tạo bản podcast cho ${mode}...`);
    try {
      const config: AudioOverviewConfig = {
        ...audioConfig,
        mode,
        length: analysisStyle === "Concise" ? "Short" : "Default" as any // Map style to length
      };
      const { audioUrl } = await generateCustomAudioOverview(image || input, config);
      setDeepAudioUrls(prev => ({ ...prev, [mode]: audioUrl }));
      
      // Get duration
      const tempAudio = new Audio(audioUrl);
      tempAudio.onloadedmetadata = () => {
        setDeepAudioDurations(prev => ({ ...prev, [mode]: tempAudio.duration }));
      };
    } catch (error: any) {
      console.error("Error generating mode audio:", error);
      setError(error.message || `Failed to generate audio for ${mode}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeepAnalysis = async (m: DeepAnalysisMode, s: AnalysisStyle) => {
    if (!input && !image) return;
    setDeepLoading(true);
    try {
      const content = await performDeepAnalysis(image || input, m, s);
      setDeepAnalysisResults(prev => ({ ...prev, [m]: content }));
      
      if (m === "Deep Exploration" || m === "Debate Mode") {
        try {
          const audio = await generateMultiSpeakerSpeech(content, audioConfig.voiceType, m);
          setDeepAudioUrls(prev => ({ ...prev, [m]: audio }));
        } catch (audioErr: any) {
          console.error("Multi-speaker audio error:", audioErr);
          setError(audioErr.message || "Failed to generate multi-speaker audio.");
        }
      }
    } catch (error: any) {
      console.error("Error in deep analysis:", error);
      setError(error.message || "Deep analysis failed.");
    } finally {
      setDeepLoading(false);
    }
  };

  const onTabChange = (m: DeepAnalysisMode) => {
    setActiveDeepMode(m);
    if (!deepAnalysisResults[m]) {
      handleDeepAnalysis(m, analysisStyle);
    }
  };

  const handleGenerateFacebookPost = async () => {
    if (!analysis) return;
    setFacebookLoading(true);
    setIsCreatingPost(true);
    try {
      const post = await generateFacebookPost(analysis, facebookPostStyle);
      setFacebookPost(post);
    } catch (error) {
      console.error("Error generating Facebook post:", error);
    } finally {
      setFacebookLoading(false);
    }
  };

  const onStyleChange = (s: AnalysisStyle) => {
    setAnalysisStyle(s);
    handleDeepAnalysis(activeDeepMode, s);
  };

  const toggleAudio = (url: string | null, mode?: DeepAnalysisMode) => {
    if (audioRef.current && url) {
      if (isPlaying && audioRef.current.src === url) {
        audioRef.current.pause();
        if (musicRef.current) musicRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
        
        // Handle background music
        if (audioConfig.hasBackgroundMusic && musicRef.current) {
          musicRef.current.volume = 0.15;
          musicRef.current.play();
        }
        
        // Update duration if not set
        audioRef.current.onloadedmetadata = () => {
          if (mode) {
            setDeepAudioDurations(prev => ({ ...prev, [mode]: audioRef.current?.duration }));
          } else {
            setAudioDuration(audioRef.current?.duration || null);
          }
        };
      }
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput;
    setChatInput('');
    
    const newHistory = [...chatHistory, { role: "user", parts: [{ text: userMessage }] }];
    setChatHistory(newHistory);
    setIsChatLoading(true);
    
    try {
      const context = analysis ? `Người dùng đang thảo luận về cuốn sách: ${analysis.title}. Tóm tắt: ${analysis.summary}` : "";
      const reply = await chatWithAI(userMessage, chatHistory, context);
      
      setChatHistory(prev => [...prev, { role: "model", parts: [{ text: reply }] }]);
      
      // Auto generate podcast (audio) from the reply as requested
      const audio = await generateSpeech(reply);
      setChatAudioUrl(audio);
      
      // Auto play the reply audio
      if (audioRef.current) {
        audioRef.current.src = audio;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.message || "Không thể gửi tin nhắn.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateSeries = async () => {
    if (!input && !image) return;
    setIsGeneratingSeries(true);
    setLoading(true);
    setLoadingText("Đang tạo chuỗi podcast nhiều tập...");
    try {
      const series = await generatePodcastSeries(image || input);
      setPodcastSeries(series);
    } catch (error: any) {
      console.error("Error generating series:", error);
      setError(error.message || "Không thể tạo chuỗi podcast.");
    } finally {
      setIsGeneratingSeries(false);
      setLoading(false);
    }
  };

  const downloadAudio = (url: string | null, filename: string) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getVoiceName = (type: VoiceType) => {
    if (type === "Nam") return "echo";
    if (type === "Nữ") return "nova";
    return "alloy";
  };

  const openFullStudio = () => {
    setFullPodcastSections({
      deep: deepAnalysisResults["Deep Exploration"] || "",
      summary: analysis?.summary || "",
      critique: deepAnalysisResults["Critical Review"] || "",
      debate: deepAnalysisResults["Debate Mode"] || ""
    });
    setFullAudioUrl(null);
    setIsFullStudioOpen(true);
  };

  const handleGenerateFullPodcast = async () => {
    const { deep, summary, critique, debate } = fullPodcastSections;
    
    if (!deep && !summary && !critique && !debate) {
      setError("Vui lòng điền ít nhất một phần nội dung.");
      return;
    }

    setIsGeneratingFullPodcast(true);
    setIsCreatingPodcast(true);
    setError(null);
    setPodcastScript([]);
    setActiveScriptIndex(-1);
    try {
      const { audioUrl, script } = await generateFullPodcastStudio(fullPodcastSections);
      setFullAudioUrl(audioUrl);
      setPodcastScript(script);
      
      // Auto play
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
      }

      // Start highlighting (approximate timing)
      let currentIndex = 0;
      const interval = setInterval(() => {
        setActiveScriptIndex(currentIndex);
        currentIndex++;
        if (currentIndex >= script.length) clearInterval(interval);
      }, 5000); // 5 seconds per part as a rough estimate

    } catch (err: any) {
      console.error("Full podcast generation error:", err);
      setError(err.message || "Không thể tạo podcast đầy đủ.");
    } finally {
      setIsGeneratingFullPodcast(false);
    }
  };

  const handleCreateCustomAudio = async () => {
    if (!input && !image) return;
    setCustomAudioLoading(true);
    setIsAudioConfigOpen(false);
    setLoading(true);
    setLoadingText("AI đang tạo podcast...");
    
    try {
      const { content, audioUrl } = await generateCustomAudioOverview(image || input, audioConfig);
      setDeepAnalysisResults(prev => ({ ...prev, [audioConfig.mode]: content }));
      setDeepAudioUrls(prev => ({ ...prev, [audioConfig.mode]: audioUrl }));
      
      // Get duration
      const tempAudio = new Audio(audioUrl);
      tempAudio.onloadedmetadata = () => {
        setDeepAudioDurations(prev => ({ ...prev, [audioConfig.mode]: tempAudio.duration }));
      };
      
      setActiveDeepMode(audioConfig.mode);
      
      if (!analysis) {
        setAnalysis({
          title: "Custom Audio Overview",
          summary: content,
          keyIdeas: [],
          podcastScript: content,
          insights: [],
          contentIdeas: { tiktok: [], youtube: [], blog: [] }
        });
      }
    } catch (error: any) {
      console.error("Error creating custom audio:", error);
      setError(error.message || "Failed to create custom audio overview.");
    } finally {
      setCustomAudioLoading(false);
      setLoading(false);
    }
  };

  const deepModes: { id: DeepAnalysisMode; label: string; icon: any; description: string }[] = [
    { id: "Deep Exploration", label: "Tìm hiểu sâu", icon: Search, description: "Một cuộc trò chuyện sôi nổi giữa 2 máy chủ AI, phân tích và kết nối các chủ đề" },
    { id: "Quick Summary", label: "Tóm tắt", icon: FileText, description: "Thông tin tổng quan ngắn gọn giúp bạn nắm bắt nhanh ý chính" },
    { id: "Critical Review", label: "Phê bình", icon: Shield, description: "Một bài đánh giá chuyên gia với phản hồi mang tính xây dựng" },
    { id: "Debate Mode", label: "Tranh luận", icon: MessageSquare, description: "Một cuộc tranh luận giữa 2 góc nhìn khác nhau" },
  ];

  const smartModes: { id: AnalysisMode; label: string; description: string }[] = [
    { id: "Beginner", label: "Beginner", description: "Ngôn ngữ đơn giản, dễ hiểu" },
    { id: "Deep Analysis", label: "Advanced", description: "Phân tích sâu, đa chiều" },
    { id: "Business Thinking", label: "Business Mindset", description: "Chiến lược, ROI, thực thi" }
  ];

  const hanoiLibraryImg = "https://storage.googleapis.com/test-media-bucket-v1/cl_images/0195a67c-f179-7988-918d-63953686866a/1.png";

  return (
    <div className="relative overflow-x-hidden">
      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md"
          >
            <div className="glass-ui p-4 border-red-500/50 bg-red-500/10 flex items-center justify-between gap-4 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <X className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-sm font-bold text-white/90">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="p-1 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hidden Spotlights for cleaner Dark Luxury look */}

      <div className="main-content relative z-10">
        <div className="center-card" style={{ backgroundImage: `url(${hanoiLibraryImg})` }}>
          <div className="overlay-text">
            TRUNG TÂM VĂN HÓA<br />
            VÀ THƯ VIỆN HÀ NỘI
          </div>
        </div>

        <header className="max-w-5xl mx-auto pt-16 pb-12 px-6 text-center relative z-10">
          <RunnerScene />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="hero"
          >
            <div className="top-badge" id="badge3d" ref={badgeRef}>
          <span className="badge-top">HANOI CULTURAL AND LIBRARY CENTER</span>
          <span className="badge-sub">AI BOOK SUMMARY PRO</span>
        </div>
        <h1 className="hero-title" ref={parallaxRef}>
                <span className="line1">
                  <span className="word">Đọc</span>
                  <span className="word">ít</span>
                  <span className="word">hơn,</span>
                </span><br />

                <span className="line2">
                  <span className="word">Hiểu</span>
                  <span className="word">nhiều</span>
                  <span className="word">hơn</span>
                </span>
            </h1>
            <p className="hero-sub">
              Không cần đọc hết, nhưng phải hiểu hết.<br />
              <span className="sub-highlight">Làm ít thôi. AI lo phần còn lại.</span>
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
            {smartModes.map((m) => (
              <motion.button
                key={m.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode(m.id)}
                className={cn(
                  "mode-btn",
                  mode === m.id && "active"
                )}
              >
                {m.label}
              </motion.button>
            ))}
          </div>

          <div className="max-w-3xl mx-auto relative group">
            <div className="flex items-center gap-2 mb-3 px-2">
              <Zap className="w-4 h-4 text-accent-primary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent-primary/80">Thanh Tóm Tắt Thông Minh</span>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <div className="flex-1 search-box">
                <div className="flex-1 flex items-center w-full">
                  <Search className="w-6 h-6 text-white/20 ml-4" />
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Nhập tên sách hoặc nội dung..."
                    className="flex-1 bg-transparent px-4 py-4 text-lg focus:outline-none placeholder:text-white/20 font-light"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "p-3 rounded-xl transition-colors",
                      imagePreview ? "text-[var(--primary)] bg-[var(--primary)]/10" : "text-[var(--text-muted)] hover:bg-[var(--glass-bg)] hover:text-[var(--primary)]"
                    )}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsAudioConfigOpen(true)}
                    className="p-3 hover:bg-[var(--glass-bg)] rounded-xl transition-colors text-[var(--text-muted)] hover:text-[var(--primary)]"
                  >
                    <Volume2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleProcess}
                    disabled={loading || (!input && !image)}
                    className="btn-luxury whitespace-nowrap"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Tóm tắt
                  </motion.button>
                </div>
              </div>

              {imagePreview && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  className="relative w-full md:w-32 h-32 md:h-auto rounded-2xl overflow-hidden border border-white/10 glass shadow-2xl group/preview"
                >
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <button 
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full opacity-0 group-hover/preview:opacity-100 transition-all duration-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </header>

      <main className="max-w-5xl mx-auto px-6 space-y-16 relative z-10">
        {/* Results Section */}
        <AnimatePresence mode="wait">
          {loading && !analysis && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SkeletonLoader />
            </motion.div>
          )}

          {analysis && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-12"
            >
              {/* Three Column Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-1000">
                {/* Card 1: Summary */}
                <motion.div 
                  initial={{ opacity: 0, rotateY: -10 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  whileHover={{ rotateY: 5, z: 50 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
                  className="glass p-8 space-y-6 flex flex-col min-h-[450px] relative group/card"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity rounded-3xl" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center shadow-lg shadow-[var(--primary)]/10">
                        <BookOpen className="w-6 h-6 text-[var(--primary)]" />
                      </div>
                      <h3 className="text-xl font-display font-bold">Tóm tắt</h3>
                    </div>
                    <Settings2 className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                  <div className="flex-1 text-sm leading-relaxed text-[var(--text-muted)] space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 relative z-10">
                    <TypewriterText text={analysis.summary} />
                  </div>
                </motion.div>

                {/* Card 2: Key Ideas */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -10, z: 50 }}
                  transition={{ delay: 0.2 }}
                  className="glass p-8 space-y-6 flex flex-col min-h-[450px] relative group/card"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity rounded-3xl" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-neon-blue/20 flex items-center justify-center shadow-lg shadow-neon-blue/10">
                        <Search className="w-6 h-6 text-neon-blue" />
                      </div>
                      <h3 className="text-xl font-display font-bold">Ý chính</h3>
                    </div>
                    <Settings2 className="w-4 h-4 text-white/20" />
                  </div>
                  <ul className="flex-1 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 relative z-10">
                    {analysis.keyIdeas.map((idea, i) => (
                      <motion.li 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="flex gap-3 items-start group/item"
                      >
                        <div className="w-2 h-2 rounded-full bg-neon-blue mt-1.5 shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.8)]" />
                        <span className="text-sm text-white/60 group-hover/item:text-white/90 transition-colors">{idea}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                {/* Card 3: Podcast Script */}
                <motion.div 
                  initial={{ opacity: 0, rotateY: 10 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  whileHover={{ rotateY: -5, z: 50 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                  className="glass p-8 space-y-6 flex flex-col min-h-[450px] relative group/card"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity rounded-3xl" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-neon-purple/20 flex items-center justify-center shadow-lg shadow-neon-purple/10">
                        <Mic className="w-6 h-6 text-neon-purple" />
                      </div>
                      <h3 className="text-xl font-display font-bold">Podcast</h3>
                    </div>
                    <Settings2 className="w-4 h-4 text-white/20" />
                  </div>
                  <div className="flex-1 text-sm leading-relaxed text-[var(--text-muted)] italic overflow-y-auto max-h-[400px] custom-scrollbar pr-2 relative z-10">
                    <Markdown>{analysis.podcastScript}</Markdown>
                  </div>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-6">
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(245,158,11,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleAudio(audioUrl)}
                  className="px-12 py-5 text-black rounded-2xl flex items-center gap-3 font-black text-lg transition-all shadow-2xl"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  Nghe Podcast
                </motion.button>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    { icon: Volume2, label: "Tùy chỉnh", onClick: () => setIsAudioConfigOpen(true) },
                    { icon: Mic, label: "Full Studio", onClick: openFullStudio },
                    { icon: Mic, label: "Tạo chuỗi Podcast", onClick: handleGenerateSeries },
                    { icon: FileDown, label: "Xuất PDF" },
                    { icon: Video, label: "TikTok" },
                    { icon: Share2, label: "Chia sẻ" }
                  ].map((btn, i) => (
                    <motion.button 
                      key={i}
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={btn.onClick}
                      className="px-6 py-4 glass-ui flex items-center gap-3 font-bold text-sm border-white/5"
                    >
                      <btn.icon className="w-4 h-4 text-accent-primary" /> {btn.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Podcast Series Section */}
              <AnimatePresence>
                {podcastSeries && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-16 space-y-8"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: 'var(--primary)', opacity: 0.2, borderColor: 'var(--primary)' }}>
                        <Mic className="w-6 h-6" style={{ color: 'var(--primary)' }} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-white">{podcastSeries.tenPodcast}</h2>
                        <p className="text-white/40 text-sm uppercase tracking-widest font-bold">Chuỗi Podcast AI Đa Tập</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {podcastSeries.tap.map((tap, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ y: -5 }}
                          className="glass p-6 space-y-4 border-white/5 hover:border-amber-500/30 transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-500/60 uppercase tracking-tighter">Tập {idx + 1}</span>
                            <div className="flex items-center gap-1 text-white/20 text-[10px] font-bold">
                              <Clock className="w-3 h-3" /> {tap.thoiLuong}
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">{tap.tieuDe}</h3>
                          <div className="flex items-center gap-3 pt-2">
                            <button 
                              onClick={() => toggleAudio(tap.audio)}
                              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all"
                            >
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </button>
                            <button 
                              onClick={() => downloadAudio(tap.audio, tap.tieuDe)}
                              className="p-2 text-white/20 hover:text-white transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Deep Analysis Modes Section */}
              <section className="space-y-12 pt-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Zap className="w-6 h-6 text-accent-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold uppercase tracking-[0.3em] text-white/80">
                        AI DEEP ANALYSIS MODES
                      </h2>
                      <p className="text-white/30 text-xs font-bold uppercase tracking-widest mt-1">Phân tích chuyên sâu đa chiều</p>
                    </div>
                  </div>

                  {/* Style Selector */}
                  <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl self-start">
                    {(["Concise", "Deep"] as AnalysisStyle[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => onStyleChange(s)}
                        className={cn(
                          "px-6 py-2 text-xs font-bold rounded-lg transition-all",
                          analysisStyle === s ? "bg-accent-primary text-black shadow-lg" : "text-white/30 hover:text-white/50"
                        )}
                      >
                        {s === "Concise" ? "Ngắn gọn" : "Chuyên sâu"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {deepModes.map((m) => (
                    <motion.button
                      key={m.id}
                      whileHover={{ scale: 1.02, y: -4, backgroundColor: "rgba(255,255,255,0.08)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onTabChange(m.id)}
                      className={cn(
                        "p-6 rounded-3xl border text-left transition-all duration-500 group relative overflow-hidden",
                        activeDeepMode === m.id 
                          ? "bg-accent-primary/10 border-accent-primary shadow-[0_0_40px_rgba(245,158,11,0.15)]" 
                          : "bg-white/5 border-white/5 hover:border-white/20"
                      )}
                    >
                      {activeDeepMode === m.id && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-transparent pointer-events-none"
                        />
                      )}
                      <div className="flex items-center gap-4 mb-3 relative z-10">
                        <m.icon className={cn("w-7 h-7 transition-colors duration-500", activeDeepMode === m.id ? "text-accent-primary" : "text-white/20 group-hover:text-white/40")} />
                        <span className={cn("font-black text-sm uppercase tracking-wider", activeDeepMode === m.id ? "text-white" : "text-white/40")}>{m.label}</span>
                      </div>
                      <p className="text-[11px] text-white/30 leading-relaxed relative z-10 font-medium">{m.description}</p>
                    </motion.button>
                  ))}
                </div>

                {/* Content Area */}
                <div className="glass-ui p-8 md:p-12 min-h-[400px] relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    {deepLoading ? (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#0f172a]/40 backdrop-blur-sm z-20"
                      >
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin" />
                          <Sparkles className="w-6 h-6 text-accent-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                        <p className="text-accent-primary font-display font-bold uppercase tracking-[0.3em] text-xs animate-pulse">
                          AI đang suy luận...
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={activeDeepMode}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                        <div className="flex items-center justify-between border-b border-white/5 pb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center">
                              {deepModes.find(m => m.id === activeDeepMode)?.icon && React.createElement(deepModes.find(m => m.id === activeDeepMode)!.icon, { className: "w-5 h-5 text-accent-primary" })}
                            </div>
                            <h3 className="text-xl font-display font-bold">{deepModes.find(m => m.id === activeDeepMode)?.label}</h3>
                          </div>
                          <div className="flex items-center gap-4">
                            {deepAudioUrls[activeDeepMode] ? (
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-1 rounded-md">
                                  ⏱️ {formatDuration(deepAudioDurations[activeDeepMode])}
                                </span>
                                <button 
                                  onClick={() => toggleAudio(deepAudioUrls[activeDeepMode]!, activeDeepMode)}
                                  className="px-6 py-2 bg-accent-primary/20 border border-accent-primary/30 text-accent-primary rounded-xl flex items-center gap-3 font-bold text-xs hover:bg-accent-primary/30 transition-all"
                                >
                                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                  Nghe Podcast
                                </button>
                                <button 
                                  onClick={() => downloadAudio(deepAudioUrls[activeDeepMode]!, `Podcast_${activeDeepMode}`)}
                                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-accent-primary"
                                  title="Tải về"
                                >
                                  <Download className="w-5 h-5" />
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleGenerateModeAudio(activeDeepMode)}
                                className="px-6 py-2 bg-white/5 border border-white/10 text-white/60 rounded-xl flex items-center gap-3 font-bold text-xs hover:bg-white/10 hover:text-white transition-all"
                              >
                                <Volume2 className="w-4 h-4" />
                                Tạo bản podcast
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeepAnalysis(activeDeepMode, analysisStyle)}
                              className="p-3 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-accent-primary"
                              title="Làm mới"
                            >
                              <RefreshCw className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => copyToClipboard(deepAnalysisResults[activeDeepMode] || "", "deep")}
                              className="p-3 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-accent-primary"
                            >
                              {copied === "deep" ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-white/70 prose-strong:text-accent-primary">
                          {deepAnalysisResults[activeDeepMode] ? (
                            <TypewriterText text={deepAnalysisResults[activeDeepMode]!} />
                          ) : (
                            <p className="text-white/20 italic">Vui lòng chọn một chế độ để bắt đầu phân tích...</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* Facebook Post Generator Section */}
              <section className="space-y-12 pt-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-600/30 shadow-lg shadow-blue-600/10">
                      <Facebook className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold uppercase tracking-[0.3em] text-white/80">
                        FACEBOOK POST GENERATOR
                      </h2>
                      <p className="text-white/30 text-xs font-bold uppercase tracking-widest mt-1">Viết bài chuẩn Quản trị viên</p>
                    </div>
                  </div>

                  {/* Style Selector */}
                  <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl self-start">
                    {(["Storytelling", "Professional", "Hook-based", "Short & Sweet"] as FacebookPostStyle[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setFacebookPostStyle(s)}
                        className={cn(
                          "px-4 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-wider",
                          facebookPostStyle === s ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-white/30 hover:text-white/50"
                        )}
                      >
                        {s === "Short & Sweet" ? "Ngắn gọn" : s === "Hook-based" ? "Hook" : s === "Storytelling" ? "Kể chuyện" : "Chuyên nghiệp"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass-ui p-8 md:p-12 min-h-[300px] relative overflow-hidden border-blue-600/10">
                  <AnimatePresence mode="wait">
                    {facebookLoading ? (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-blue-900/10 backdrop-blur-sm z-20"
                      >
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                          <Facebook className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                        <div className="w-full max-w-md px-4">
                          <GenerateProgress 
                            isRunning={isCreatingPost} 
                            label="Đang soạn thảo bài viết..." 
                            onComplete={() => setIsCreatingPost(false)}
                          />
                        </div>
                      </motion.div>
                    ) : facebookPost ? (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                      >
                        <div className="flex items-center justify-between border-b border-white/5 pb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                              AD
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-white">Admin Page</h3>
                              <p className="text-[10px] text-white/30 uppercase tracking-widest">Vừa xong • Công khai</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={handleGenerateFacebookPost}
                              className="p-3 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-blue-400"
                              title="Viết lại"
                            >
                              <RefreshCw className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => copyToClipboard(facebookPost, "fb")}
                              className="px-6 py-2 bg-blue-600/20 border border-blue-600/30 text-blue-400 rounded-xl flex items-center gap-3 font-bold text-xs hover:bg-blue-600/30 transition-all"
                            >
                              {copied === "fb" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              Sao chép bài viết
                            </button>
                          </div>
                        </div>

                        <div className="whitespace-pre-wrap text-white/80 leading-relaxed font-medium text-sm md:text-base selection:bg-blue-500/30">
                          {facebookPost}
                        </div>
                        
                        <div className="pt-6 border-t border-white/5 flex items-center gap-6 text-white/20">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" />
                            </div>
                            Chuẩn SEO Facebook
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            Tối ưu tương tác
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                        <div className="w-20 h-20 rounded-3xl bg-blue-600/10 flex items-center justify-center border border-blue-600/20">
                          <Facebook className="w-10 h-10 text-blue-500/40" />
                        </div>
                        <div>
                          <p className="text-white/40 text-lg font-display font-medium mb-2">Sẵn sàng viết bài đăng Facebook</p>
                          <p className="text-white/20 text-sm max-w-md mx-auto">Chọn phong cách và nhấn nút bên dưới để AI tạo bài giới thiệu sách chuyên nghiệp chuẩn Admin Fanpage.</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(37,99,235,0.2)" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleGenerateFacebookPost}
                          className="px-10 py-4 bg-blue-600 text-white rounded-2xl flex items-center gap-3 font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all"
                        >
                          <Sparkles className="w-5 h-5" />
                          Tạo bài đăng Facebook
                        </motion.button>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* Podcast Cover Generation Section */}
              <section className="space-y-12 pt-12">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                    <ImageIcon className="w-6 h-6 text-accent-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-bold uppercase tracking-[0.3em] text-white/80">
                    PODCAST COVER GENERATION
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                  {analysis && covers.length === 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(245,158,11,0.2)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGenerateCovers}
                      disabled={isGeneratingCovers}
                      className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em] disabled:opacity-50 transition-all"
                    >
                      {isGeneratingCovers ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Đang tạo...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-accent-primary" /> Tạo bìa Podcast
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {covers.length > 0 ? covers.map((url, i) => (
                    <div key={i} className="space-y-4">
                      <motion.div 
                        whileHover={{ scale: 1.05, y: -10, rotate: i % 2 === 0 ? 2 : -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative aspect-square rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl border border-white/10 group"
                        onClick={() => setSelectedCover(url)}
                      >
                        <img src={url} alt={`Cover ${i}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                            <Maximize2 className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest">Xem chi tiết</span>
                        </div>
                      </motion.div>
                      <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] text-center font-black">
                        {i + 1}. {i === 0 ? "Minimal Clean" : i === 1 ? "Dark Cinematic" : i === 2 ? "Bold Modern" : "Artistic Abstract"}
                      </p>
                    </div>
                  )) : isGeneratingCovers ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="aspect-square bg-white/5 rounded-[2rem] animate-pulse border border-white/5 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white/10 animate-spin" />
                      </div>
                    ))
                  ) : (
                    <motion.div 
                      whileHover={{ borderColor: "rgba(245,158,11,0.2)", backgroundColor: "rgba(255,255,255,0.02)" }}
                      className="col-span-full py-20 flex flex-col items-center justify-center glass-ui rounded-[2.5rem] border-dashed border-2 border-white/5 transition-all"
                    >
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                        <ImageIcon className="w-10 h-10 text-white/10" />
                      </div>
                      <p className="text-white/40 text-lg font-display font-medium mb-2">Chưa có ảnh bìa Podcast</p>
                      <p className="text-white/20 text-sm max-w-md text-center">Nhấn nút "Tạo bìa Podcast" để AI thiết kế 4 phong cách nghệ thuật độc bản cho chương trình của bạn.</p>
                    </motion.div>
                  )}
                </div>
              </section>

              {/* AI Discussion Chat Section */}
              <section className="space-y-12 pt-24">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                    <MessageSquare className="w-6 h-6 text-accent-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold uppercase tracking-[0.3em] text-white/80">
                      THẢO LUẬN AI (SMART CHAT)
                    </h2>
                    <p className="text-white/30 text-xs font-bold uppercase tracking-widest mt-1">Hỏi đáp và đào sâu kiến thức cùng AI</p>
                  </div>
                </div>

                <div className="glass-ui p-8 md:p-12 min-h-[500px] flex flex-col gap-8">
                  <div className="flex-1 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
                    {chatHistory.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                        <MessageSquare className="w-16 h-16" />
                        <p className="text-sm font-medium">Bắt đầu cuộc trò chuyện về cuốn sách này...</p>
                      </div>
                    ) : (
                      chatHistory.map((msg, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "chat-msg",
                            msg.role === "user" ? "user" : "bot"
                          )}
                        >
                          <Markdown>{msg.parts[0].text}</Markdown>
                        </motion.div>
                      ))
                    )}
                    {isChatLoading && (
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                          <Loader2 className="w-5 h-5 animate-spin text-white/40" />
                        </div>
                        <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5">
                          <div className="flex gap-2">
                            <div className="w-2 h-2 bg-white/20 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-white/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-2 h-2 bg-white/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <input 
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Đặt câu hỏi về nội dung sách..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-6 text-sm focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all pr-24"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={isChatLoading || !chatInput.trim()}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-accent-primary text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-white/20 text-center uppercase tracking-widest font-black">
                    AI sẽ tự động tạo bản tin âm thanh cho mỗi câu trả lời
                  </p>
                </div>
              </section>

              <audio 
                ref={audioRef} 
                onEnded={() => {
                  setIsPlaying(false);
                  if (musicRef.current) musicRef.current.pause();
                }} 
                className="hidden" 
              />
              <audio 
                ref={musicRef} 
                src="https://cdn.pixabay.com/audio/2022/05/27/audio_1808d304b3.mp3" 
                loop 
                className="hidden" 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedCover && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6"
            onClick={() => setSelectedCover(null)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X className="w-10 h-10" />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={selectedCover} 
              className="max-w-full max-h-full rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10" 
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio Overview Config Modal */}
      <AnimatePresence>
        {isAudioConfigOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsAudioConfigOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass-ui p-8 md:p-12 space-y-10 overflow-y-auto max-h-[90vh] custom-scrollbar border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-[1.25rem] bg-accent-primary/20 flex items-center justify-center shadow-xl shadow-accent-primary/10">
                    <Volume2 className="w-7 h-7 text-accent-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-display font-black tracking-tight">Tùy chỉnh Podcast</h2>
                    <p className="text-white/40 text-sm font-medium">Cấu hình cách AI tạo nội dung âm thanh</p>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsAudioConfigOpen(false)}
                  className="p-3 hover:bg-white/5 rounded-2xl transition-colors"
                >
                  <X className="w-7 h-7 text-white/40" />
                </motion.button>
              </div>

              {/* SECTION 1: MODE SELECTION */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-primary flex items-center gap-4">
                  <span className="w-10 h-px bg-accent-primary/20" />
                  CHẾ ĐỘ PHÂN TÍCH
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {deepModes.map((m) => (
                    <motion.button
                      key={m.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setAudioConfig(prev => ({ ...prev, mode: m.id }))}
                      className={cn(
                        "p-6 rounded-3xl border text-left transition-all duration-500 group relative overflow-hidden",
                        audioConfig.mode === m.id 
                          ? "bg-accent-primary/10 border-accent-primary/50 shadow-[0_0_40px_rgba(245,158,11,0.2)]" 
                          : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-start gap-5 relative z-10">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg",
                          audioConfig.mode === m.id ? "bg-accent-primary text-black scale-110 shadow-accent-primary/20" : "bg-white/5 text-white/40 group-hover:text-white/60"
                        )}>
                          <m.icon className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                          <h4 className={cn(
                            "font-black text-lg mb-1 transition-colors uppercase tracking-tight",
                            audioConfig.mode === m.id ? "text-white" : "text-white/60 group-hover:text-white/80"
                          )}>{m.label}</h4>
                          <p className="text-[11px] text-white/30 leading-relaxed group-hover:text-white/50 transition-colors font-medium">
                            {m.description}
                          </p>
                        </div>
                      </div>
                      {audioConfig.mode === m.id && (
                        <motion.div 
                          layoutId="active-glow-modal"
                          className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-transparent pointer-events-none"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* SECTION 2: LANGUAGE */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20 flex items-center gap-3">
                    <span className="w-8 h-px bg-white/5" />
                    NGÔN NGỮ
                  </h3>
                  <div className="relative group">
                    <select 
                      value={audioConfig.language}
                      onChange={(e) => setAudioConfig(prev => ({ ...prev, language: e.target.value as AudioOverviewLanguage }))}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-white focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 appearance-none transition-all hover:bg-white/[0.05] hover:border-white/20 cursor-pointer font-bold text-sm"
                    >
                      <option value="Tiếng Việt" className="bg-zinc-900">Tiếng Việt (Mặc định)</option>
                      <option value="English" className="bg-zinc-900">English (Quốc tế)</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-white/40 transition-colors">
                      <ChevronRight className="w-5 h-5 rotate-90" />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: LENGTH */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20 flex items-center gap-3">
                    <span className="w-8 h-px bg-white/5" />
                    ĐỘ DÀI BẢN TIN
                  </h3>
                  <div className="flex p-1.5 bg-white/[0.03] border border-white/10 rounded-2xl">
                    {(["Short", "Default", "Long"] as AudioOverviewLength[]).map((l) => (
                      <motion.button
                        key={l}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAudioConfig(prev => ({ ...prev, length: l }))}
                        className={cn(
                          "flex-1 py-4 text-[11px] font-black rounded-xl transition-all duration-500 uppercase tracking-wider",
                          audioConfig.length === l 
                            ? "bg-accent-primary text-black shadow-lg shadow-accent-primary/20" 
                            : "text-white/30 hover:text-white/60 hover:bg-white/5"
                        )}
                      >
                        {l === "Short" ? "NGẮN" : l === "Long" ? "DÀI" : "MẶC ĐỊNH"}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* NEW SECTION: VOICE SELECTION */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20 flex items-center gap-3">
                    <span className="w-8 h-px bg-white/5" />
                    CHỌN GIỌNG
                  </h3>
                  <div className="flex p-1.5 bg-white/[0.03] border border-white/10 rounded-2xl">
                    {(["Nam", "Nữ", "Podcast host"] as VoiceType[]).map((v) => (
                      <motion.button
                        key={v}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAudioConfig(prev => ({ ...prev, voiceType: v }))}
                        className={cn(
                          "flex-1 py-4 text-[11px] font-black rounded-xl transition-all duration-500 uppercase tracking-wider",
                          audioConfig.voiceType === v 
                            ? "bg-accent-primary text-black shadow-lg shadow-accent-primary/20" 
                            : "text-white/30 hover:text-white/60 hover:bg-white/5"
                        )}
                      >
                        {v === "Podcast host" ? "HOST" : v.toUpperCase()}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* NEW SECTION: BACKGROUND MUSIC */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20 flex items-center gap-3">
                    <span className="w-8 h-px bg-white/5" />
                    NHẠC NỀN
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setAudioConfig(prev => ({ ...prev, hasBackgroundMusic: !prev.hasBackgroundMusic }))}
                    className={cn(
                      "w-full p-5 rounded-2xl border transition-all duration-500 flex items-center justify-between group overflow-hidden relative",
                      audioConfig.hasBackgroundMusic 
                        ? "bg-accent-primary/10 border-accent-primary/30 text-white" 
                        : "bg-white/[0.03] border-white/10 text-white/30 hover:border-white/20"
                    )}
                  >
                    <span className="text-sm font-black uppercase tracking-tight">Bật nhạc nền nhẹ</span>
                    <div className={cn(
                      "w-12 h-6 rounded-full relative transition-colors duration-500",
                      audioConfig.hasBackgroundMusic ? "bg-accent-primary" : "bg-white/10"
                    )}>
                      <motion.div 
                        animate={{ x: audioConfig.hasBackgroundMusic ? 26 : 4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                      />
                    </div>
                    {audioConfig.hasBackgroundMusic && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 to-transparent pointer-events-none"
                      />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* SECTION 4: CUSTOM INSTRUCTION */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20 flex items-center gap-3">
                  <span className="w-8 h-px bg-white/5" />
                  YÊU CẦU BỔ SUNG
                </h3>
                <div className="relative group">
                  <textarea 
                    value={audioConfig.customInstruction}
                    onChange={(e) => setAudioConfig(prev => ({ ...prev, customInstruction: e.target.value }))}
                    placeholder="Ví dụ: 'Hãy kể theo trình tự thời gian' hoặc 'Phân tích theo góc nhìn kinh doanh'..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-sm focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all min-h-[140px] resize-none placeholder:text-white/10 text-white/80 font-medium leading-relaxed"
                  />
                  <div className="absolute bottom-4 right-4 text-[10px] font-black text-white/10 uppercase tracking-widest pointer-events-none group-focus-within:text-accent-primary/30 transition-colors">
                    Optional
                  </div>
                </div>
              </div>

              {/* SECTION 5: ACTION */}
              <div className="pt-6">
                <motion.button 
                  whileHover={{ scale: 1.02, translateY: -4 }}
                  whileTap={{ scale: 0.98, translateY: 0 }}
                  onClick={handleCreateCustomAudio}
                  disabled={loading || (!input && !image)}
                  className="w-full h-20 bg-accent-primary text-black rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-accent-primary/20 hover:shadow-accent-primary/40 transition-all duration-500 disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none group relative overflow-hidden"
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer"
                  />
                  <Sparkles className="w-7 h-7 group-hover:rotate-12 transition-transform duration-500" />
                  <span className="text-lg">Tạo bản tin âm thanh</span>
                </motion.button>
                <p className="text-center text-[10px] text-white/20 mt-6 uppercase tracking-[0.3em] font-black">
                  AI sẽ mất khoảng 30-60 giây để xử lý kịch bản và giọng nói
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="max-w-5xl mx-auto py-12 px-6 border-t border-white/5 text-center text-white/20 text-xs font-display uppercase tracking-[0.3em]">
        <p>© 2026 Hanoi Cultural and Library Center • AI Book Summary Pro</p>
      </footer>

      {/* Full Podcast Studio Modal */}
      <AnimatePresence>
        {isFullStudioOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              onClick={() => setIsFullStudioOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-4xl glass-ui p-8 md:p-12 space-y-8 overflow-y-auto max-h-[90vh] custom-scrollbar border-white/20 shadow-[0_0_150px_rgba(0,0,0,0.9)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-accent-primary/20 flex items-center justify-center shadow-2xl shadow-accent-primary/10">
                    <Mic className="w-7 h-7 text-accent-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-display font-black tracking-tight">Full Podcast Studio</h2>
                    <p className="text-white/40 text-sm font-medium">Biên tập và tạo bản Podcast hoàn chỉnh từ các mục phân tích</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsFullStudioOpen(false)}
                  className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-white/20 hover:text-white"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-accent-primary flex items-center gap-2">
                    <Search className="w-3 h-3" /> Tìm hiểu sâu
                  </label>
                  <textarea 
                    value={fullPodcastSections.deep}
                    onChange={(e) => setFullPodcastSections(prev => ({ ...prev, deep: e.target.value }))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-sm focus:ring-2 focus:ring-accent-primary/50 transition-all min-h-[150px] resize-none text-white/70 font-medium leading-relaxed"
                    placeholder="Nội dung phần tìm hiểu sâu..."
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neon-blue flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Tóm tắt nội dung
                  </label>
                  <textarea 
                    value={fullPodcastSections.summary}
                    onChange={(e) => setFullPodcastSections(prev => ({ ...prev, summary: e.target.value }))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-sm focus:ring-2 focus:ring-neon-blue/50 transition-all min-h-[150px] resize-none text-white/70 font-medium leading-relaxed"
                    placeholder="Nội dung phần tóm tắt..."
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neon-purple flex items-center gap-2">
                    <Shield className="w-3 h-3" /> Góc nhìn phê bình
                  </label>
                  <textarea 
                    value={fullPodcastSections.critique}
                    onChange={(e) => setFullPodcastSections(prev => ({ ...prev, critique: e.target.value }))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-sm focus:ring-2 focus:ring-neon-purple/50 transition-all min-h-[150px] resize-none text-white/70 font-medium leading-relaxed"
                    placeholder="Nội dung phần phê bình..."
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" /> Tranh luận đa chiều
                  </label>
                  <textarea 
                    value={fullPodcastSections.debate}
                    onChange={(e) => setFullPodcastSections(prev => ({ ...prev, debate: e.target.value }))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-sm focus:ring-2 focus:ring-red-400/50 transition-all min-h-[150px] resize-none text-white/70 font-medium leading-relaxed"
                    placeholder="Nội dung phần tranh luận..."
                  />
                </div>
              </div>

              {/* Script View (NotebookLM Style) */}
              <AnimatePresence>
                {podcastScript.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-3">
                      <span className="w-8 h-px bg-white/5" />
                      KỊCH BẢN PODCAST (LIVE SCRIPT)
                    </h3>
                    <div className="glass-ui p-8 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar bg-white/[0.02]">
                      {podcastScript.map((part, index) => (
                        <motion.div 
                          key={index}
                          animate={{ 
                            opacity: activeScriptIndex === index ? 1 : 0.3,
                            scale: activeScriptIndex === index ? 1.02 : 1,
                            backgroundColor: activeScriptIndex === index ? "rgba(245,158,11,0.05)" : "transparent"
                          }}
                          className={cn(
                            "p-4 rounded-xl transition-all duration-500 border border-transparent",
                            activeScriptIndex === index && "border-accent-primary/20 shadow-[0_0_30px_rgba(245,158,11,0.05)]"
                          )}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black",
                              part.speaker === "A" ? "bg-accent-primary text-black" : "bg-neon-blue text-black"
                            )}>
                              {part.speaker}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                              {part.speaker === "A" ? "Host A (Wavenet-D)" : "Host B (Wavenet-A)"}
                            </span>
                          </div>
                          <p className="text-sm text-white/80 leading-relaxed font-medium">
                            {part.text}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                  <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl">
                    {(["Nam", "Nữ"] as VoiceType[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => setAudioConfig(prev => ({ ...prev, voiceType: v }))}
                        className={cn(
                          "px-6 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-wider",
                          audioConfig.voiceType === v ? "bg-accent-primary text-black shadow-lg" : "text-white/30 hover:text-white/50"
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Chọn giọng đọc</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  {isGeneratingFullPodcast && (
                    <div className="flex-1 min-w-[300px]">
                      <GenerateProgress 
                        isRunning={isCreatingPodcast} 
                        label="Đang biên tập Podcast..." 
                        onComplete={() => setIsCreatingPodcast(false)}
                      />
                    </div>
                  )}
                  {fullAudioUrl && (
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => downloadAudio(fullAudioUrl, "Full_Podcast")}
                      className="p-5 glass-ui rounded-2xl text-accent-primary hover:bg-white/5 transition-all"
                      title="Tải về MP3"
                    >
                      <Download className="w-6 h-6" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateFullPodcast}
                    disabled={isGeneratingFullPodcast}
                    className="flex-1 md:flex-none px-12 py-5 bg-accent-primary text-black rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-accent-primary/20 disabled:opacity-50 transition-all"
                  >
                    {isGeneratingFullPodcast ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6" />
                        <span>Tạo Podcast Full</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
