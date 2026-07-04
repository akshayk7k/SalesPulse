import { Avatar, AvatarFallback, AvatarImage } from "./avatar.jsx";
import { Mail, ShieldCheck } from "lucide-react";

export function ProfileHeader({ contactInfo, account, avatar }) {
  let departmentSet = new Set();
  account.contacts.forEach((contact) => {
    if (contact.DEPARTMENT) {
      departmentSet.add(contact.DEPARTMENT);
    }
  });

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between p-6 bg-slate-950/30 border-b border-slate-900/60 rounded-t-3xl text-left gap-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center text-center sm:text-left">
        <Avatar className="h-16 w-16 border border-slate-800 shadow-md">
          <AvatarImage src={`${avatar}`} />
          <AvatarFallback className="bg-slate-800 text-cyan-400 font-bold text-lg">
            {contactInfo.FIRST_NAME[0] + contactInfo.LAST_NAME[0]}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 justify-center sm:justify-start">
            {contactInfo.FIRST_NAME + " " + contactInfo.LAST_NAME}
            {contactInfo.CLEAN_STATUS === "Verified" && (
              <ShieldCheck className="h-5 w-5 text-cyan-400 fill-cyan-950/20" />
            )}
          </h1>
          <p className="text-sm font-semibold text-cyan-400/90 tracking-wide uppercase">
            {contactInfo.TITLE || "No Title"}
          </p>
          <div className="flex items-center gap-2 justify-center sm:justify-start text-xs text-slate-400 font-light">
            <span>{account.account.Name}</span>
            <span className="text-slate-600">•</span>
            <span>{contactInfo.DEPARTMENT || "No Department"}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 sm:mt-0 text-center sm:text-right">
        <div className="text-2xl md:text-3xl font-extrabold text-white">
          {account.contacts.length}
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Connected colleagues</div>
        <div className="text-[11px] text-slate-400 mt-0.5">
          Across {departmentSet.size || 1} departments
        </div>
      </div>
    </div>
  );
}
