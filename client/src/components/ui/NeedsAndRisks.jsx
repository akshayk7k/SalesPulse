import { Card, CardContent, CardHeader, CardTitle } from "./card";
import ProgressBar from "./progressBar";
import { LoaderCircleIcon } from "lucide-react";
import { useSelector } from "react-redux";

export default function NeedsAndRisks() {
  const needsAndRisks = useSelector((state) => state.needsAndRisks);
  return (
    <>
      <div className="lg:col-span-2">
        <Card className="bg-slate-900/30 border border-slate-900/80 rounded-3xl" style={{ height: "100%" }}>
          <CardHeader className="pb-3 border-b border-slate-900/50">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400" />
              Needs Analysis
            </CardTitle>
          </CardHeader>
          {needsAndRisks ? (
            needsAndRisks.error ? (
              <CardContent className="text-left text-slate-400 pt-4 text-sm italic">
                Unable to fetch needs details.
              </CardContent>
            ) : (
              <CardContent className="space-y-4 pt-4 text-left">
                <div className="space-y-3">
                  <p className="text-sm text-slate-300 font-light leading-relaxed">
                    {needsAndRisks.overallNeeds}
                  </p>
                  <div className="space-y-1">
                    <ul className="space-y-2 text-sm text-slate-200">
                      {needsAndRisks.needsDetail.map((item, index) => (
                        <li className="block w-full" key={index}>
                          <ProgressBar
                            label={item.name}
                            value={parseInt(item.fulfiled)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-48">
              <LoaderCircleIcon className="text-cyan-400 animate-spin h-8 w-8 mb-2" />
              <p className="text-xs text-slate-500">Mapping requirements...</p>
            </div>
          )}
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="bg-slate-900/30 border border-slate-900/80 rounded-3xl" style={{ height: "100%" }}>
          <CardHeader className="pb-3 border-b border-slate-900/50">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-rose-400 to-red-500" />
              Risk Analysis
            </CardTitle>
          </CardHeader>
          {needsAndRisks ? (
            needsAndRisks.error ? (
              <CardContent className="text-left text-slate-400 pt-4 text-sm italic">
                Unable to fetch risk details.
              </CardContent>
            ) : (
              <CardContent className="space-y-4 pt-4 text-left">
                <div className="space-y-3">
                  <p className="text-sm text-slate-300 font-light leading-relaxed">
                    {needsAndRisks.overallRisks}
                  </p>
                  <div className="space-y-1">
                    <ul className="space-y-2 text-sm text-slate-200">
                      {needsAndRisks.riskDetail.map((item, index) => (
                        <li className="block w-full" key={index}>
                          <ProgressBar
                            label={item.name}
                            value={parseInt(item.riskParam)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-48">
              <LoaderCircleIcon className="text-cyan-400 animate-spin h-8 w-8 mb-2" />
              <p className="text-xs text-slate-500">Evaluating deal risk...</p>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
