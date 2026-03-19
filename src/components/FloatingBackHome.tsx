import { useEffect, useState } from "react";
import { Home } from "lucide-react";

export default function FloatingBackHome() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => (window.location.href = "/")}
      className="fixed bottom-6 right-6 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-[60] flex items-center gap-2 font-bold group"
    >
      <Home className="w-5 h-5 group-hover:rotate-12 transition-transform" />
      <span>Trang chủ</span>
      <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
    </button>
  );
}
