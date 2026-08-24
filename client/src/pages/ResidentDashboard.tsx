import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/complaintService';
import type { ComplaintStats } from '../types';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  FileText,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  Loader2,
  ArrowRight,
  PlusSquare,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function ResidentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ComplaintStats | null>(null);
  const [hasOverdue, setHasOverdue] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, overdueData] = await Promise.all([
          complaintService.getComplaintStats(),
          complaintService.getComplaints({ isOverdue: true, limit: 1 })
        ]);
        setStats(statsData);
        setHasOverdue(overdueData.complaints.length > 0);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      label: 'My Complaints',
      value: stats?.total ?? '—',
      icon: FileText,
      color: 'from-violet-500 to-indigo-500',
      shadow: 'shadow-violet-500/20',
    },
    {
      label: 'In Progress',
      value: stats?.inProgress ?? '—',
      icon: Clock,
      color: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/20',
    },
    {
      label: 'Resolved',
      value: stats?.resolved ?? '—',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-500',
      shadow: 'shadow-emerald-500/20',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Home className="w-5 h-5 text-violet-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Dashboard
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            Welcome back, <span className="text-gray-300">{user?.name}</span>. Here's your activity summary.
          </p>
        </div>
        <button
          onClick={() => navigate('/complaints/new')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-violet-500/25 transition-all text-sm"
        >
          <PlusSquare className="w-4 h-4" />
          New Complaint
        </button>
      </div>

      {hasOverdue && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-400 font-medium">Overdue Complaints</h3>
            <p className="text-sm text-red-400/80 mt-1">
              You have complaints that have exceeded the standard resolution timeframe. We are prioritizing them.
            </p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="group relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.06] transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.shadow}`}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-gray-500" /> : stat.value}
            </p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Links</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/complaints')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                  <FileText className="w-4 h-4" />
                </div>
                <span>View My Complaints</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-violet-400 transition-colors" />
            </button>
            <button
              disabled
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-gray-400 cursor-not-allowed opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Society Events</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold">Coming Soon</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
