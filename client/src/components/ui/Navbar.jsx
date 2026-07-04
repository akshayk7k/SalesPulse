import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { useSelector } from "react-redux";

export default function NavBar({
  activeTab,
  setActiveTab,
  opportunities,
  currentOpportunity,
  onOpportunityChange,
  opportunity,
  onHomeClick,
}) {
  const account = useSelector((state) => state.account);
  return (
    <div className="flex flex-col md:flex-row items-center px-6 py-3 bg-slate-950/40 backdrop-blur-md border-b border-slate-900/60 h-auto md:h-16 w-full">
      {/* Logo and Home Click */}
      <div
        className="flex items-center cursor-pointer hover:opacity-80 md:flex-none md:mr-auto mb-2 md:mb-0 transition-all flex-shrink-0"
        onClick={onHomeClick}
      >
        <img
          src="/SalesPulse Logo.png"
          alt="SalesPulse Logo"
          className="h-[150px] w-auto object-contain -my-14 flex-shrink-0"
        />
      </div>

      {account.exists && opportunity && (
        <div className="flex flex-1 flex-col md:flex-row items-center w-full md:justify-between md:w-auto md:space-x-4 md:m-1">
          {/* Center Tabs */}
          <div className="hidden md:flex flex-1 items-center justify-center space-x-6">
            {["Overview", "Strategy", "Relationships"].map((tab) => (
              <a
                key={tab}
                className={`text-sm font-medium px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                }`}
                onClick={() => {
                  localStorage.setItem("activeTab", tab);
                  setActiveTab(tab);
                }}
              >
                {tab}
              </a>
            ))}
          </div>

          {/* Tabs Dropdown for Small Screens */}
          <div className="flex md:hidden w-full justify-center mb-4 gap-4">
            <Select
              value={activeTab}
              onValueChange={(value) => {
                localStorage.setItem("activeTab", value);
                setActiveTab(value);
              }}
            >
              <div className="p-[1px] bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-md">
                <SelectTrigger className="w-full bg-gray-800 border-none h-8 rounded-md text-white text-sm">
                  <SelectValue placeholder="Select tab" />
                </SelectTrigger>
              </div>
              <SelectContent>
                {["Overview", "Strategy", "Relationships"].map((tab) => (
                  <SelectItem key={tab} value={tab}>
                    {tab}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Opportunity Picker */}
          <div className="flex items-center w-full md:w-auto justify-center md:justify-end md:m-1">
            {activeTab === "Overview" ? (
              <Select
                value={currentOpportunity?.ID || ""}
                onValueChange={onOpportunityChange}
              >
                <div className="p-[1px] bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-md">
                  <SelectTrigger className="w-full md:w-[180px] bg-gray-800 border-none h-8 rounded-md text-white text-sm">
                    <SelectValue placeholder="Select opportunity" />
                  </SelectTrigger>
                </div>
                <SelectContent>
                  {opportunities?.map((opp) => (
                    <SelectItem key={opp.ID} value={opp.ID}>
                      {opp.NAME}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="w-full md:w-[180px] h-8"></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
