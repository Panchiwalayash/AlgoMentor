import React from "react";
import { Code2, ArrowLeft } from "lucide-react";

interface Props {
  showBack: boolean;
  onBack?: () => void;
}

export const Header: React.FC<Props> = ({ showBack, onBack }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-white tracking-tight">
            AlgoMentor
          </h1>
        </div>
      </div>
    </header>
  );
};
