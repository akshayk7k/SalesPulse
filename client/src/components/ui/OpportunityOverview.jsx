import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import {
  CalendarIcon,
  DollarSign,
  Building2,
  Users,
  Globe,
  TrendingUp,
} from "lucide-react";

function OpportunityOverview({ opportunity, overview }) {
  return (
    <div className="w-full space-y-6 text-left pb-16">
      
      {/* Title Header */}
      <div className="mb-8">
        <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400">
          Opportunity Overview
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1 tracking-tight">
          {opportunity.NAME}
        </h1>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="bg-slate-900/30 border border-slate-900/80 rounded-3xl p-4 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent className="p-0 pt-3">
            <div className="text-2xl font-bold text-white">
              ${opportunity.AMOUNT.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-light">
              Stage: <span className="text-cyan-400 font-medium">{opportunity.STAGE_NAME}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/30 border border-slate-900/80 rounded-3xl p-4 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Close Date</CardTitle>
            <CalendarIcon className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent className="p-0 pt-3">
            <div className="text-2xl font-bold text-white">
              {new Date(opportunity.CLOSE_DATE).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/30 border border-slate-900/80 rounded-3xl p-4 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Industry</CardTitle>
            <Building2 className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent className="p-0 pt-3">
            <div className="text-2xl font-bold text-white">{opportunity.INDUSTRY || "N/A"}</div>
            {opportunity.ANNUAL_REVENUE && (
              <p className="text-xs text-slate-400 mt-1 font-light">
                Revenue: <span className="text-slate-200 font-medium">${opportunity.ANNUAL_REVENUE.toLocaleString()}</span>
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/30 border border-slate-900/80 rounded-3xl p-4 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Company Size</CardTitle>
            <Users className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent className="p-0 pt-3">
            <div className="text-2xl font-bold text-white">
              {opportunity.NUMBER_OF_EMPLOYEES ? opportunity.NUMBER_OF_EMPLOYEES.toLocaleString() : "N/A"}
            </div>
            {opportunity.NUMBEROF_LOCATIONS_C && (
              <p className="text-xs text-slate-400 mt-1 font-light">
                Locations: <span className="text-slate-200 font-medium">{opportunity.NUMBEROF_LOCATIONS_C}</span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description Card */}
      {opportunity.DESCRIPTION && (
        <Card className="bg-slate-900/30 border border-slate-900/80 rounded-3xl p-6 backdrop-blur-md">
          <CardHeader className="p-0 pb-3 border-b border-slate-900/50">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Globe className="h-4 w-4 text-cyan-400" />
              Company Description
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <p className="text-sm text-slate-300 font-light leading-relaxed">{opportunity.DESCRIPTION}</p>
          </CardContent>
        </Card>
      )}

      {/* Strategic Details Cards */}
      <div className="space-y-4">
        {Object.entries(overview).map(([section, data]) => (
          <Card key={section} className="bg-slate-900/30 border border-slate-900/80 rounded-3xl p-6 backdrop-blur-md">
            <CardHeader className="p-0 pb-3 border-b border-slate-900/50">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                {section}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} className="space-y-2 text-left bg-slate-950/20 p-4 border border-slate-900/40 rounded-2xl">
                    <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-800/30 text-[10px] font-semibold py-0.5 px-2.5 rounded-full uppercase tracking-wider">
                      {key}
                    </Badge>
                    <p className="text-sm text-slate-300 font-light leading-relaxed">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

OpportunityOverview.propTypes = {
  opportunity: PropTypes.shape({
    NAME: PropTypes.string.isRequired,
    AMOUNT: PropTypes.number.isRequired,
    CLOSE_DATE: PropTypes.string.isRequired,
    STAGE_NAME: PropTypes.string.isRequired,
    INDUSTRY: PropTypes.string,
    ANNUAL_REVENUE: PropTypes.number,
    NUMBER_OF_EMPLOYEES: PropTypes.number,
    NUMBEROF_LOCATIONS_C: PropTypes.number,
    DESCRIPTION: PropTypes.string,
  }).isRequired,
  overview: PropTypes.shape({
    Challenges: PropTypes.object,
    Strategies: PropTypes.object,
    Relationship: PropTypes.object,
    Outcome: PropTypes.object,
    Insights: PropTypes.object,
  }).isRequired,
};

export default OpportunityOverview;
