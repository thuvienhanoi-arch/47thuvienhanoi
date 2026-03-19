import { useEffect, useState } from "react";

interface GenerateProgressProps {
  isRunning: boolean;
  label: string;
  onComplete?: () => void;
}

export default function GenerateProgress({ isRunning, label, onComplete }: GenerateProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      setProgress(0);

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            if (onComplete) {
              setTimeout(onComplete, 1000);
            }
            return 100;
          }
          // Simulate progress
          const increment = Math.random() * 15;
          return Math.min(prev + increment, 100);
        });
      }, 400);
    }

    return () => clearInterval(interval);
  }, [isRunning, onComplete]);

  if (!isRunning) return null;

  return (
    <div className="w-full max-w-xl mx-auto mt-6 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
      <div className="flex justify-between items-center text-sm mb-3">
        <div className="flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
          <span className="font-medium text-white/80">{label}</span>
        </div>
        <span className="font-bold text-[var(--primary)]">{Math.floor(progress)}%</span>
      </div>

      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[var(--primary)] to-orange-400 transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
