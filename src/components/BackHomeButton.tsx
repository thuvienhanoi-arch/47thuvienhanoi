import React from 'react';
import { LogOut } from 'lucide-react';

export default function BackHomeButton() {
  const handleBack = () => {
    // Xóa token / session
    localStorage.removeItem("token");

    // quay về trang ngoài (reload to clear state)
    window.location.href = "/";
  };

  return (
    <button
      onClick={handleBack}
      className="fixed top-6 left-6 px-5 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 rounded-xl shadow-lg hover:shadow-red-500/20 transition-all duration-300 z-[70] flex items-center gap-2 font-bold group backdrop-blur-md"
    >
      <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      <span>← Về Trang chủ</span>
    </button>
  );
}
