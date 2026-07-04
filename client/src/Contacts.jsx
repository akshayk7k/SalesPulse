import { useLocation, useNavigate } from "react-router-dom";
import { ProfileHeader } from "./components/ui/ProfileHeader";
import { useEffect, useState } from "react";
import { LatestConversation } from "./components/ui/LatestConversation";
import { ActivityFeed } from "./components/ui/ActivityFeed";
import ActivityTrends from "./components/ui/ActivityTrend";
import { LoaderCircleIcon, ChevronLeft } from "lucide-react";
import { ScrollArea } from "./components/ui/scroll-area";

export default function Contacts() {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(() => {
    if (location.state) {
      window.localStorage.setItem("data", JSON.stringify(location.state));
    }
    const data = window.localStorage.getItem("data");
    return data ? JSON.parse(data) : location.state;
  });

  useEffect(() => {
    if (location.state) {
      window.localStorage.setItem("data", JSON.stringify(location.state));
      setData(location.state);
    }
  }, [location.state]);

  if (!data) {
    return (
      <div className="h-screen w-screen bg-[#0b0f19] flex items-center justify-center">
        <LoaderCircleIcon className="h-10 w-10 text-cyan-400 animate-spin" />
      </div>
    );
  }

  let activity =
    data.account.emailMessagesGroupedByContact[data.contact.ID] || [];
  for (let event of data.account.events) {
    if (event.WHO_ID === data.contact.ID) {
      activity.push(event);
    }
  }
  activity = activity
    .map((obj) => {
      obj = { ...obj }; 

      if (obj.Date) {
        obj.commonDate = new Date(obj.Date);
      } else if (obj.ACTIVITY_DATE_TIME) {
        obj.commonDate = new Date(obj.ACTIVITY_DATE_TIME);
      }
      return obj;
    })
    .sort((a, b) => a.commonDate - b.commonDate);

  return (
    <div className="bg-[#0b0f19] text-slate-200 min-h-screen w-screen flex flex-col justify-start overflow-hidden relative">
      
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-slate-950/20 backdrop-blur-md">
        <button
          className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-200 rounded-full flex items-center gap-1.5 shadow-md hover:bg-slate-800/80 hover:border-cyan-500/30 transition-all text-xs font-semibold"
          onClick={() => navigate("/")}
        >
          <ChevronLeft className="h-4 w-4 text-cyan-400" /> Back to Dashboard
        </button>
        <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
          Relationship Map
        </span>
      </div>

      <div className="flex flex-1 justify-center h-full w-full overflow-hidden">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-full overflow-y-auto">
          
          <div className="bg-slate-900/10 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
            <ProfileHeader
              contactInfo={data.contact}
              account={data.account}
              avatar={data.avatar}
            />
          </div>

          <ScrollArea className="rounded-md flex-1 mt-6">
            <div className="pb-20 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900/30 border border-slate-900/60 rounded-3xl p-5 backdrop-blur-md shadow-xl">
                  <LatestConversation
                    emailMessage={
                      data.account.emailMessagesGroupedByContact[
                        data.contact.ID
                      ]
                    }
                    contactInfo={data.contact}
                  />
                </div>
                
                <div className="bg-slate-900/30 border border-slate-900/60 rounded-3xl p-5 backdrop-blur-md shadow-xl">
                  <ActivityFeed activities={activity} contact={data.contact} />
                </div>
                
                <div className="col-span-1 lg:col-span-2 bg-slate-900/30 border border-slate-900/60 rounded-3xl p-5 backdrop-blur-md shadow-xl">
                  <ActivityTrends
                    activities={activity}
                    emailData={
                      data.account.emailMessagesGroupedByContact[
                        data.contact.ID
                      ]
                    }
                    contact={data.contact}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
          
        </div>
      </div>
    </div>
  );
}
