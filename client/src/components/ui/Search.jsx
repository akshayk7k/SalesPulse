import * as React from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { BACKENDURL } from "../../utils/requests.js";

export default function SearchInterface({ setAccountName }) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [inputFocused, setInputFocused] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [error, setError] = React.useState(null);

  const fetchResults = React.useCallback(
    async (searchQuery) => {
      if (results.length <= 0) {
        setLoading(true);
      }
      try {
        const res = await fetch(`${BACKENDURL}search/`, {
          method: "POST",
          body: JSON.stringify({ searchQuery: searchQuery }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }
        if (data.searchResults) {
          if (data.searchResults.length > 0) {
            setActiveIndex(0);
          }
          setResults(data.searchResults);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [results.length]
  );

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        fetchResults(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, fetchResults]);

  const selectActiveResult = React.useCallback(() => {
    if (activeIndex !== -1 && results[activeIndex]) {
      const activeResult = results[activeIndex];
      setInputFocused(false);
      setAccountName(activeResult.NAME);
      setQuery("");
      setResults([]);
      document.activeElement.blur();
    }
  }, [activeIndex, results, setAccountName]);

  const handleArrowDown = React.useCallback((e) => {
    if (e) e.preventDefault();
    if (results.length === 0) return;
    if (activeIndex === results.length - 1) {
      setActiveIndex(0);
    } else {
      setActiveIndex((prev) => prev + 1);
    }
  }, [activeIndex, results.length]);

  const handleArrowUp = React.useCallback((e) => {
    if (e) e.preventDefault();
    if (results.length === 0) return;
    if (activeIndex === 0 || activeIndex === -1) {
      setActiveIndex(results.length - 1);
    } else {
      setActiveIndex((prev) => prev - 1);
    }
  }, [activeIndex, results.length]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      handleArrowDown(e);
    } else if (e.key === "ArrowUp") {
      handleArrowUp(e);
    } else if (e.key === "Enter" && activeIndex !== -1) {
      selectActiveResult();
    }
  };

  const handleResultClick = (result, index) => {
    setInputFocused(false);
    setActiveIndex(index);
    setAccountName(result.NAME);
    setQuery("");
    setResults([]);
  };

  return (
    <div
      className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-2xl transition-all duration-300 w-full"
      onKeyDown={handleKeyDown}
    >
      <div className="relative">
        {loading ? (
          <Loader2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-400 animate-spin" />
        ) : (
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        )}
        <input
          type="search"
          placeholder="Type account name to search..."
          value={query}
          onFocus={() => setInputFocused(true)}
          onBlur={() => {
            // Delay so that click event goes through
            setTimeout(() => {
              if (!query) setInputFocused(false);
            }, 250);
          }}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 pl-12 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200"
        />
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-950/40 border border-red-900/40 rounded-2xl text-xs text-red-400">
          Error loading accounts: {error}
        </div>
      )}

      {(inputFocused || query) && (
        <div className="mt-4 space-y-4">
          {results.length > 0 ? (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 px-1">
                Found CRM Accounts
              </h3>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center w-full gap-3 p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      activeIndex === index
                        ? "bg-cyan-950/30 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-white scale-[1.01]"
                        : "bg-slate-950/25 border-slate-900 hover:bg-slate-800/40 hover:border-slate-800 text-slate-300 hover:scale-[1.005]"
                    }`}
                    onClick={() => handleResultClick(result, index)}
                  >
                    <Avatar className="h-9 w-9 border border-slate-800">
                      <AvatarImage
                        src={`https://cdn.brandfetch.io/${result.WEBSITE}?c=1idaroPYX6MwOp6glye`}
                      />
                      <AvatarFallback className="bg-slate-800 text-cyan-400 font-bold text-xs">
                        {result.NAME ? result.NAME[0].toUpperCase() : "A"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-grow text-left">
                      <div className="font-semibold text-sm">{result.NAME}</div>
                      <div className="text-xs text-slate-400 font-light flex gap-2 mt-0.5">
                        {result.TYPE && <span className="text-cyan-400/90 font-medium">{result.TYPE}</span>}
                        {result.WEBSITE && (
                          <span className="text-slate-500 truncate max-w-xs">{result.WEBSITE}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            query && !loading && (
              <div className="text-sm text-slate-500 py-2 px-1 text-left font-light">
                No matching accounts in Salesforce.
              </div>
            )
          )}

          {/* Keyboard & Mouse Clickable Navigation Hints */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 text-xs text-slate-500">
            <span className="font-light">Use arrows or click buttons to select & open</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleArrowUp}
                className="px-3 py-1.5 bg-slate-900 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-semibold cursor-pointer select-none transition-all duration-150"
                title="Previous"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={handleArrowDown}
                className="px-3 py-1.5 bg-slate-900 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-semibold cursor-pointer select-none transition-all duration-150"
                title="Next"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={selectActiveResult}
                className="px-4 py-1.5 bg-cyan-950/40 hover:bg-cyan-950/60 border border-cyan-800/40 hover:border-cyan-500/50 text-cyan-400 hover:text-cyan-300 rounded-lg text-xs font-semibold cursor-pointer select-none transition-all duration-150 shadow-md shadow-cyan-950/20"
                title="Open Selected"
              >
                ↵ Enter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
