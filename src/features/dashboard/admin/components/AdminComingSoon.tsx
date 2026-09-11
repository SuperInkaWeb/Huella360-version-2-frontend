import { type LucideIcon, Clock, Sparkles } from "lucide-react";

interface AdminComingSoonProps {
 title: string;
 description: string;
 icon: LucideIcon;
}

export const AdminComingSoon = ({ title, description, icon: Icon }: AdminComingSoonProps) => {
 return (
 <div className="h-full flex items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-700">
 <div className="relative max-w-2xl w-full text-center space-y-8">
 {/* Animated Background Glows */}
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#1ea59c]/10 blur-[100px] rounded-full animate-pulse" />
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#2D3E82]/10 blur-[80px] rounded-full delay-700 animate-pulse" />

 {/* Dynamic Icon Stack */}
 <div className="relative inline-flex">
 <div className="absolute -inset-4 bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/40 shadow-soft" />
 <div className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#1ea59c] to-[#2D3E82] rounded-[2rem] text-white shadow-xl shadow-[#2D3E82]/20 group">
 <Icon size={48} strokeWidth={1.5} className="group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" />
 <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-xl flex items-center justify-center text-[#1ea59c] shadow-md animate-bounce">
 <Clock size={16} strokeWidth={3} />
 </div>
 </div>
 </div>

 {/* Content Section */}
 <div className="space-y-4 relative z-10">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#1ea59c]/10 text-[#1ea59c] text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-[#1ea59c]/20">
 <Sparkles size={12} /> Roadmap 2026
 </div>
 <h2 className="text-5xl font-black text-[#2D3E82] tracking-tight leading-tight">
 Sección de <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1ea59c] to-[#2D3E82]">
 {title}
 </span>
 </h2>
 <p className="text-slate-500 font-medium text-lg max-w-md mx-auto leading-relaxed">
 {description}
 </p>
 </div>

 {/* Interactive Element */}
 <div className="pt-6 relative z-10">
 <div className="inline-flex items-center gap-6 p-2 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-soft">
 <div className="flex -space-x-2 px-2">
 {[1, 2, 3].map(i => (
 <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-${i + 1}00 flex items-center justify-center text-[10px] font-bold text-slate-500`}>
 JS
 </div>
 ))}
 <div className="w-8 h-8 rounded-full border-2 border-white bg-[#1ea59c] flex items-center justify-center text-[10px] font-bold text-white">
 +12
 </div>
 </div>
 <p className="text-[11px] font-bold text-slate-400 pr-4">
 Equipo trabajando en esta sección
 </p>
 </div>
 </div>

 {/* Status Pills */}
 <div className="flex items-center justify-center gap-8 pt-4">
 <div className="flex items-center gap-2 text-slate-400">
 <div className="w-2 h-2 rounded-full bg-[#1ea59c]" />
 <span className="text-xs font-black uppercase tracking-widest">Designing</span>
 </div>
 <div className="flex items-center gap-2 text-slate-400">
 <div className="w-2 h-2 rounded-full bg-slate-200" />
 <span className="text-xs font-black uppercase tracking-widest">Coding</span>
 </div>
 <div className="flex items-center gap-2 text-slate-400">
 <div className="w-2 h-2 rounded-full bg-slate-200" />
 <span className="text-xs font-black uppercase tracking-widest">Testing</span>
 </div>
 </div>
 </div>
 </div>
 );
};
