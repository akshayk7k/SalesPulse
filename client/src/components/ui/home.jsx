import SearchBar from "./Search";
import { Sparkles, Database } from "lucide-react";

export default function Home({ setAccountName }) {
  return (
    <div className="relative bg-[#090d16] text-[#e2e8f0] flex flex-col justify-center items-center min-h-screen p-6 overflow-hidden w-full">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none" />
      
      <div className="flex flex-col w-full max-w-2xl z-10">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-6 self-start px-1 py-1 rounded-full bg-slate-900/80 border border-slate-800/60 backdrop-blur-md">
          <div className="flex items-center justify-center bg-gradient-to-tr from-cyan-500 to-indigo-500 p-1.5 rounded-full text-white">
            <Database className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400/90 pr-3 pl-1">
            Connected to Salesforce CRM
          </span>
        </div>

        {/* Text Headers */}
        <div className="mb-10 w-full text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mb-3">
            Hey there!
          </h1>
          <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-300 flex items-center gap-2">
            Begin your account search <Sparkles className="h-6 w-6 text-cyan-400 animate-pulse inline" />
          </p>
          <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-lg font-light leading-relaxed">
            Search for any synchronized Salesforce account to generate AI-driven strategies, review relationship maps, and uncover deals metrics.
          </p>
        </div>

        {/* Search Bar Wrapper */}
        <div className="w-full">
          <SearchBar setAccountName={setAccountName} />
        </div>

      </div>
    </div>
  );
}
