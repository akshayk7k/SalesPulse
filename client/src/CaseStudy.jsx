import OpportunityOverview from "./components/ui/OpportunityOverview";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function CaseStudy() {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100%",
        width: "100vw",
        minHeight: "100vh",
      }}
      className="flex flex-col items-center justify-start bg-[#0b0f19] text-slate-200 p-6 relative overflow-y-auto"
    >
      {/* Header / Navigation */}
      <div className="w-full max-w-7xl flex items-center justify-between py-4 mb-6 border-b border-slate-900">
        <button
          className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-200 rounded-full flex items-center gap-1.5 shadow-md hover:bg-slate-800/80 hover:border-cyan-500/30 transition-all text-xs font-semibold"
          onClick={() => navigate("/")}
        >
          <ChevronLeft className="h-4 w-4 text-cyan-400" /> Back to Dashboard
        </button>
        <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
          Case Study & Opportunity Details
        </span>
      </div>

      <div className="w-full max-w-7xl">
        <OpportunityOverview
          opportunity={state.opportunity}
          overview={state.overview}
        />
      </div>
    </div>
  );
}
