import { Badge } from "./badge";
import StratergyText from "./StratergyText";
import { useNavigate } from "react-router";
import { LoaderCircleIcon, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";

export default function StratergyPage() {
  const account = useSelector((state) => state.account);
  const valuePropositions = useSelector((state) => state.strategy);
  
  const OpportunityName = {
    nucor_account_001: [
      "blast furnace for ArcelorMittal",
      "measuring device for steel dynamics",
    ],
    tesla_account_001: [
      "nestle factory expansion",
      "steel material for Milan museum",
    ],
    paris_airport_001: [
      "expansion of Milan airport",
      "steel material for NYC subway",
    ],
  };

  const navigate = useNavigate();

  if (
    !valuePropositions ||
    !account.exists ||
    !valuePropositions.stratergy ||
    !valuePropositions.insights
  ) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <LoaderCircleIcon className="text-cyan-400 animate-spin h-10 w-10 mb-4" />
        <p className="text-slate-400 text-sm animate-pulse">Analyzing CRM records & generating strategic proposal...</p>
      </div>
    );
  }

  const stratergy = valuePropositions.stratergy;
  let insights = valuePropositions.insights.slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Page Header */}
      <div className="mb-10 text-left">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight flex items-center gap-3">
          Strategy Plan <Sparkles className="h-6 w-6 text-cyan-400 animate-pulse" />
        </h1>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          AI-generated tactical proposal tailored to this account's historical conversations and deal stages.
        </p>
      </div>

      {/* Target deals selection */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Based on Opportunity
        </p>
        <div className="flex flex-wrap gap-2.5">
          {insights.map((insight, index) => {
            const label = OpportunityName[account.account.ID]?.[index] || insight.opportunity.OPPORTUNITY_NAME;
            return (
              <button
                key={insight.opportunity.OPPORTUNITY_ID}
                onClick={() => navigate("/case-study/", { state: insight })}
                className="flex items-center gap-2 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-850 hover:border-cyan-500/30 text-slate-200 text-sm font-medium py-2 px-4 rounded-full transition-all duration-200 shadow-lg shadow-black/20"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Strategy Content Box */}
      <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
        <article className="prose prose-invert lg:prose-lg max-w-none">
          <StratergyText stratergy={stratergy} />
        </article>
      </div>
    </div>
  );
}
