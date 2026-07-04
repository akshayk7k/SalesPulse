import { Card, CardContent, CardHeader, CardTitle } from "./card";
import LinkPreview from "./LinkPreview";
import { LoaderCircleIcon, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";

export default function RecentUpdates() {
  const recentUpdates = useSelector((state) => state.recentUpdates);
  return (
    <div className="lg:col-span-3">
      <Card className="bg-slate-900/30 border border-slate-900/80 rounded-3xl" style={{ height: "100%" }}>
        <CardHeader className="pb-3 border-b border-slate-900/50">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 animate-pulse" />
            What&apos;s New
          </CardTitle>
        </CardHeader>
        {recentUpdates ? (
          recentUpdates.error ? (
            <CardContent className="space-y-4 pt-4">
              <p className="text-slate-400 text-sm italic text-left">
                No recent updates available.
              </p>
            </CardContent>
          ) : (
            <CardContent className="space-y-4 pt-4">
              <ul className="space-y-3 text-sm text-slate-300">
                {recentUpdates.map((item, index) => (
                  <li className="flex items-start gap-2 p-2 hover:bg-slate-950/20 rounded-2xl transition-all" key={index}>
                    <LinkPreview metadata={item} />
                  </li>
                ))}
              </ul>

              {recentUpdates.length === 0 && (
                <p className="text-slate-400 text-sm italic text-left pt-2">
                  No recent updates found for this account.
                </p>
              )}
            </CardContent>
          )
        ) : (
          <CardContent className="flex flex-col items-center justify-center h-48">
            <LoaderCircleIcon className="text-cyan-400 animate-spin h-8 w-8 mb-2" />
            <p className="text-xs text-slate-500">Retrieving new articles...</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
