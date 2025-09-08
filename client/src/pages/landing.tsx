import { useState } from "react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount >= 4) {
      setLocation("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 
          className="text-6xl md:text-8xl font-bold text-slate-800 tracking-tight cursor-pointer select-none"
          onClick={handleClick}
        >
          Turnkey Pro
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
      </div>
    </div>
  );
}