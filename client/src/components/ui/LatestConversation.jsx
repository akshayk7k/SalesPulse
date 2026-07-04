import { useState, useEffect } from "react";
import { LoaderCircle, MessageSquare } from "lucide-react";
import { BACKENDURL } from "../../utils/requests.js";

export function LatestConversation({ emailMessage, contactInfo }) {
  const [convoSnapShot, setConvoSnapShot] = useState(null);
  
  async function FetchConversationSummary(emailMessage, contactInfo) {
    const response = await fetch(
      `${BACKENDURL}contactSummary`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailMessages: emailMessage,
          contact: contactInfo,
        }),
      }
    );
    return await response.json();
  }

  useEffect(() => {
    FetchConversationSummary(emailMessage, contactInfo).then((data) => {
      setConvoSnapShot(data.updates);
    });
  }, []);

  return (
    <div className="w-full text-left space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-900/50">
        <MessageSquare className="h-4 w-4 text-cyan-400" />
        <h3 className="text-base font-semibold text-white">
          Summary of Recent Interaction
        </h3>
      </div>
      
      <div>
        {!convoSnapShot ? (
          <div className="flex flex-col items-center justify-center py-10">
            <LoaderCircle className="h-6 w-6 animate-spin text-cyan-400 mb-2" />
            <span className="text-xs text-slate-500">Generating conversation summary...</span>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-slate-300 font-light">
            {convoSnapShot}
          </p>
        )}
      </div>
    </div>
  );
}
