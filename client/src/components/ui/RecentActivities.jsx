"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Avatar, AvatarImage } from "./avatar";
import { CheckCircle, LoaderCircleIcon, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

export default function RecentActivities() {
  const recentActivities = useSelector((state) => state.recentActivities);
  return (
    <div className="lg:col-span-3">
      <Card className="bg-slate-900/30 border border-slate-900/80 rounded-3xl" style={{ height: "100%" }}>
        <CardHeader className="pb-3 border-b border-slate-900/50">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
            <motion.span
              className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            Recent Interactions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {recentActivities ? (
            recentActivities.length > 0 ? (
              recentActivities.map((update, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 group p-2 hover:bg-slate-950/20 rounded-2xl transition-all"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex-shrink-0 mt-0.5"
                  >
                    <CheckCircle className="h-5 w-5 text-cyan-400/80" />
                  </motion.div>
                  <div className="flex-1 space-y-1 text-left">
                    <p className="text-sm text-slate-200 leading-relaxed font-light">
                      {update.update}
                    </p>
                    <div className="flex flex-row items-center gap-1.5 pt-0.5">
                      <motion.div
                        className="flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        {update.source === 1 ? (
                          <>
                            <Avatar className="h-4.5 w-4.5 border border-slate-800">
                              <AvatarImage
                                src="https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg"
                                alt="Teams icon"
                              />
                            </Avatar>
                            <span className="text-[11px] text-slate-400 font-medium">Teams</span>
                          </>
                        ) : (
                          <>
                            <Avatar className="h-4.5 w-4.5 border border-slate-800">
                              <AvatarImage
                                src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg"
                                alt="Outlook icon"
                              />
                            </Avatar>
                            <span className="text-[11px] text-slate-400 font-medium">Outlook</span>
                          </>
                        )}
                      </motion.div>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-[11px] text-slate-400 font-light">{update.date}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-slate-400 text-sm italic text-left pt-2">
                No recent interactions recorded.
              </p>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-48">
              <LoaderCircleIcon className="text-cyan-400 animate-spin h-8 w-8 mb-2" />
              <p className="text-xs text-slate-500">Retrieving interactions...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
