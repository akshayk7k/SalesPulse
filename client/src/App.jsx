import SearchBar from "./components/ui/Search.jsx";
import Home from "./components/ui/home.jsx";
import NextSteps from "./components/ui/NextSteps.jsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./components/ui/avatar.jsx";
import NeedsAndRisks from "./components/ui/NeedsAndRisks.jsx";
import RecentUpdates from "./components/ui/recentUpdates.jsx";
import RecentActivites from "./components/ui/RecentActivities.jsx";
import { useEffect, useState } from "react";
import { LoaderCircleIcon } from "lucide-react";
import NavBar from "./components/ui/Navbar.jsx";
import ContactList from "./components/ui/ContactList.jsx";
import StrategyPage from "./components/ui/StrategyPage.jsx";
import { ScrollArea } from "./components/ui/scroll-area.jsx";
import { useSelector, useDispatch } from "react-redux";
import { setAccount, unsetAccount } from "./store/account/accountSlice.js";
import {
  setNextSteps,
  unsetNextSteps,
} from "./store/nextSteps/nextStepsSlice.js";
import {
  setNeedsAndRisks,
  unsetNeedsAndRisks,
} from "./store/needsAndRisks/needsAndRisksSlice.js";
import {
  setRecentActivities,
  unsetRecentActivities,
} from "./store/recentActivities/recentActivitiesSlice.js";
import {
  unsetRecentUpdates,
  setRecentUpdates,
} from "./store/recentUpdates/recentUpdatesSlice.js";
import { setStrategy, unsetStrategy } from "./store/strategy/strategySlice.js";
import {
  FetchAccountInfo,
  FetchAccountNextStep,
  FetchNeedsAndRisks,
  FetchRecentUpdates,
  FetchRecentActivities,
  FetchValuePropositions,
} from "./utils/requests.js";

function App() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [accountName, setAccountName] = useState(null);
  const [opportunity, setOpportunity] = useState(null);

  const { account } = useSelector((state) => state);
  const dispatch = useDispatch();
  function onHomeClick() {
    setAccountName(null);
    dispatch(unsetAccount());
    dispatch(unsetNextSteps());
    dispatch(unsetNeedsAndRisks());
    dispatch(unsetRecentUpdates());
    dispatch(unsetRecentActivities());
    dispatch(unsetStrategy());
    localStorage.removeItem("accountName");
    localStorage.removeItem("activeTab");
  }
  useEffect(() => {
    const tab = localStorage.getItem("activeTab");
    if (tab) {
      setActiveTab(tab);
    }
  }, []);
  useEffect(() => {
    const accountName = localStorage.getItem("accountName");
    if (accountName) {
      setAccountName(accountName);
    }
  }, []);
  useEffect(() => {
    if (accountName) {
      localStorage.setItem("accountName", accountName);
    }
    if (!accountName) {
      return;
    }
    dispatch(unsetAccount());
    dispatch(unsetNextSteps());
    dispatch(unsetNeedsAndRisks());
    dispatch(unsetRecentUpdates());
    dispatch(unsetRecentActivities());
    dispatch(unsetStrategy());

    FetchAccountInfo(accountName).then((data) => {
      dispatch(setAccount(data));
      if (data.opportunities.length > 0) {
        setOpportunity(data.opportunities[0]);
      }
    });
  }, [accountName]);

  useEffect(() => {
    if (!account.exists || !opportunity) {
      return;
    }
    dispatch(unsetNextSteps());
    dispatch(unsetNeedsAndRisks());
    dispatch(unsetRecentUpdates());
    dispatch(unsetRecentActivities());
    FetchAccountNextStep(
      account.contacts,
      account.emailMessages[opportunity.ID],
      opportunity.ID
    ).then((data) => {
      if (data && data.nextSteps && Array.isArray(data.nextSteps)) {
        if (data.nextSteps.length > 3) {
          data.nextSteps = data.nextSteps.slice(0, 3);
        }
        dispatch(setNextSteps(data));
      } else {
        dispatch(setNextSteps({ error: true, nextSteps: [], summary: "No next steps available." }));
      }
    });
    FetchNeedsAndRisks(
      account.contacts,
      account.emailMessages[opportunity.ID],
      opportunity.ID
    ).then((data) => {
      if (data && !data.error) {
        dispatch(setNeedsAndRisks(data));
      } else {
        dispatch(setNeedsAndRisks({ error: true, overallNeeds: "", needsDetail: [], overallRisks: "", riskDetail: [] }));
      }
    });
    FetchRecentUpdates(account.account).then((data) => {
      if (data && data.updates && Array.isArray(data.updates)) {
        if (data.updates.length > 4) {
          data.updates = data.updates.slice(0, 4);
        }
        dispatch(setRecentUpdates(data.updates));
      } else {
        dispatch(setRecentUpdates([]));
      }
    });
    FetchRecentActivities(
      accountName,
      account.emailMessages[opportunity.ID],
      account.events,
      opportunity.ID
    ).then((data) => {
      const updates = data && data.updates && Array.isArray(data.updates) ? data.updates : [];
      dispatch(setRecentActivities(updates));
      FetchValuePropositions(
        accountName,
        account,
        account.opportunities,
        updates
      ).then((data) => {
        dispatch(setStrategy(data));
      });
    });
  }, [opportunity]);
  if (!account.exists && accountName === null) {
    return (
      <div className="bg-[#0b0f19] text-slate-200 h-screen w-screen overflow-hidden flex flex-col">
        <Home setAccountName={setAccountName} />
      </div>
    );
  }
  if (!account.exists && accountName !== null) {
    return (
      <div
        className="bg-[#0b0f19] text-slate-200 min-h-screen flex flex-col justify-center items-center"
        style={{
          height: "100vh",
          width: "100vw",
        }}
      >
        <LoaderCircleIcon className="text-cyan-400 animate-spin h-10 w-10" />
        <p className="mt-4 text-sm text-slate-400 animate-pulse">Syncing insights and loading dashboard...</p>
      </div>
    );
  }
  const onOpportunityChange = (value) => {
    setOpportunity(account.opportunities.find((opp) => opp.ID === value));
  };
  if (account.opportunities.length === 0) {
    return (
      <div
        className="bg-[#0b0f19] text-slate-200 min-h-screen flex flex-col justify-center items-center p-4"
        style={{
          height: "100vh",
          width: "100vw",
        }}
      >
        <h1 className="text-3xl font-semibold mb-2 text-white">No open opportunities found</h1>
        <p className="text-slate-400 mb-8 max-w-md text-center">There are no open deals linked to this account in Salesforce. Try searching for a different account.</p>
        <div className="w-full max-w-xl">
          <SearchBar setAccountName={setAccountName} />
        </div>
      </div>
    );
  }
  return (
    <div className="bg-[#0b0f19] text-slate-200 h-screen w-screen overflow-hidden flex flex-col">
      {/* Top Navigation */}
      {account.exists && opportunity && (
        <NavBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          opportunities={account.opportunities}
          currentOpportunity={opportunity}
          onOpportunityChange={onOpportunityChange}
          opportunity={opportunity}
          onHomeClick={onHomeClick}
        />
      )}

      {/* Main Content */}
      <ScrollArea className="rounded-md p-4">
        <div className="flex-grow overflow-auto">
          {activeTab === "Overview" && (
            <div className="flex justify-center py-8">
              <div className="max-w-6xl w-full px-4">
                {/* Account Info Header */}
                <div className="flex flex-wrap items-end gap-6 mb-16">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={`https://cdn.brandfetch.io/${account.account.Website}?c=1idaroPYX6MwOp6glye`}
                    />
                    <AvatarFallback>{account.account.Name}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <span className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                      {account.account.Name}
                    </span>
                  </div>
                  <div className="flex flex-col items-end sm:items-start">
                    <h2 className="text-sm font-semibold tracking-wider uppercase text-cyan-400">
                      Account Owner
                    </h2>
                    <h3 className="text-lg font-medium text-slate-200 mt-1">
                      {account.owner.NAME}
                    </h3>
                    <p className="text-slate-400 text-sm break-words">
                      {account.owner.EMAIL}
                    </p>
                  </div>
                </div>

                {/* Widgets */}
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  <RecentUpdates />
                  <RecentActivites />
                  <NextSteps />
                  <NeedsAndRisks />
                </div>
              </div>
            </div>
          )}

          {activeTab === "Strategy" && (
            <div className="flex justify-center py-8">
              <div className="max-w-6xl w-full px-4">
                <StrategyPage />
              </div>
            </div>
          )}

          {activeTab === "Relationships" && (
            <div className="flex justify-center py-8">
              <div className="max-w-6xl w-full px-4">
                <ContactList />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default App;
