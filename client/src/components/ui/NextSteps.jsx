import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { LoaderCircle, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";

export default function NextSteps() {
  const nextSteps = useSelector((state) => state.nextSteps);
  return (
    <div className="lg:col-span-2">
      <Card className="bg-slate-900/30 border border-slate-900/80 rounded-3xl" style={{ height: "100%" }}>
        <CardHeader className="pb-3 border-b border-slate-900/50">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400" />
            Next Steps
          </CardTitle>
        </CardHeader>
        {nextSteps ? (
          nextSteps.error ? (
            <CardContent className="text-left text-slate-400 pt-4 text-sm italic">
              No next steps available.
            </CardContent>
          ) : (
            <CardContent className="space-y-4 pt-4 text-left">
              <p className="text-sm text-slate-300 font-light leading-relaxed">{nextSteps.summary}</p>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Action Items</span>
                <ul className="space-y-2 text-sm text-slate-200">
                  {nextSteps.nextSteps.map((item, index) => (
                    <li className="flex items-start gap-2.5" key={index}>
                      <div
                        className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"
                        style={{
                          boxShadow: "0 0 8px rgba(34, 211, 238, 0.4)"
                        }}
                      />
                      <span className="font-light">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-48">
            <LoaderCircle className="text-cyan-400 animate-spin h-8 w-8 mb-2" />
            <p className="text-xs text-slate-500">Formulating recommendations...</p>
          </div>
        )}
      </Card>
    </div>
  );
}
