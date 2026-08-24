import { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Loader2, TrendingUp, AlertCircle, CheckCircle2, Clock, CalendarDays } from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import type { AnalyticsData } from '../../types';
import { subDays, startOfMonth } from 'date-fns';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-white/[0.08] p-3 rounded-lg shadow-xl">
        <p className="text-white font-medium text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = {
  violet: '#8b5cf6',
  indigo: '#6366f1',
  emerald: '#10b981',
  rose: '#f43f5e',
  amber: '#f59e0b',
  sky: '#0ea5e9',
};

const PIE_COLORS = [COLORS.violet, COLORS.emerald, COLORS.rose, COLORS.amber, COLORS.sky, COLORS.indigo];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Date Filters
  const [dateRange, setDateRange] = useState<string>('all'); // all, 30d, 90d, thisMonth

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      let dateFrom = undefined;
      const today = new Date();
      
      if (dateRange === '30d') {
        dateFrom = subDays(today, 30).toISOString();
      } else if (dateRange === '90d') {
        dateFrom = subDays(today, 90).toISOString();
      } else if (dateRange === 'thisMonth') {
        dateFrom = startOfMonth(today).toISOString();
      }
      
      const result = await complaintService.getAnalytics(dateFrom, undefined);
      setData(result);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!data) return null;

  if (!data) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Analytics Overview
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            Live insights and historical trends for society complaints.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.08] rounded-xl p-1">
          <CalendarDays className="w-4 h-4 text-gray-400 ml-3" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent text-gray-300 text-sm focus:ring-0 outline-none p-2 cursor-pointer border-none"
          >
            <option value="all" className="bg-gray-900">All Time</option>
            <option value="30d" className="bg-gray-900">Last 30 Days</option>
            <option value="90d" className="bg-gray-900">Last 90 Days</option>
            <option value="thisMonth" className="bg-gray-900">This Month</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white/[0.02] border border-white/[0.08] p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Total</div>
          <div className="text-3xl font-bold text-white">{data.metrics.total}</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-amber-500 text-xs font-medium uppercase tracking-wider mb-2">
            <AlertCircle className="w-3.5 h-3.5" /> Open
          </div>
          <div className="text-3xl font-bold text-amber-400">{data.metrics.open}</div>
        </div>
        <div className="bg-sky-500/10 border border-sky-500/20 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-sky-500 text-xs font-medium uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5" /> In Progress
          </div>
          <div className="text-3xl font-bold text-sky-400">{data.metrics.inProgress}</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-emerald-500 text-xs font-medium uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </div>
          <div className="text-3xl font-bold text-emerald-400">{data.metrics.resolved}</div>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-rose-500 text-xs font-medium uppercase tracking-wider mb-2">
            <AlertCircle className="w-3.5 h-3.5" /> Overdue
          </div>
          <div className="text-3xl font-bold text-rose-400">{data.metrics.overdue}</div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Trend (Full Width) */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.08] p-6 rounded-2xl">
          <h3 className="text-white font-medium mb-6">Monthly Complaint Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} />
                <YAxis stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name="Complaints" 
                  stroke={COLORS.violet} 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: COLORS.violet, strokeWidth: 0 }} 
                  activeDot={{ r: 6, fill: COLORS.indigo }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white/[0.02] border border-white/[0.08] p-6 rounded-2xl">
          <h3 className="text-white font-medium mb-6">Status Distribution</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.distributions.status}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.distributions.status.map((entry, index) => {
                    let color = COLORS.violet;
                    if (entry.name === 'OPEN') color = COLORS.amber;
                    if (entry.name === 'IN_PROGRESS') color = COLORS.sky;
                    if (entry.name === 'RESOLVED') color = COLORS.emerald;
                    return <Cell key={`cell-${index}`} fill={color} stroke="rgba(0,0,0,0.2)" />;
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#ffffff80' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white/[0.02] border border-white/[0.08] p-6 rounded-2xl">
          <h3 className="text-white font-medium mb-6">Priority Breakdown</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.distributions.priority}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={90}
                  dataKey="value"
                >
                  {data.distributions.priority.map((entry, index) => {
                    let color = COLORS.emerald;
                    if (entry.name === 'MEDIUM') color = COLORS.amber;
                    if (entry.name === 'HIGH') color = COLORS.rose;
                    return <Cell key={`cell-${index}`} fill={color} stroke="rgba(0,0,0,0.2)" />;
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#ffffff80' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.08] p-6 rounded-2xl">
          <h3 className="text-white font-medium mb-6">Complaints by Category</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.distributions.category} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} width={100} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                <Bar dataKey="value" name="Total" radius={[0, 4, 4, 0]}>
                  {data.distributions.category.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
