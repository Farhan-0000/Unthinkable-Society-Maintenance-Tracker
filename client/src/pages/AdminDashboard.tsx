import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/complaintService';
import { settingService } from '../services/settingService';
import type { ComplaintStats, Complaint } from '../types';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Shield,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Loader2,
  ArrowRight,
  Settings,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ComplaintStats | null>(null);
  const [threshold, setThreshold] = useState<number>(7);
  const [criticalOverdue, setCriticalOverdue] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, settingsData, overdueData] = await Promise.all([
          complaintService.getComplaintStats(),
          settingService.getSettings(),
          complaintService.getComplaints({ isOverdue: true, limit: 5 })
        ]);
        setStats(statsData);
        setThreshold(settingsData.overdueThresholdDays);
        setCriticalOverdue(overdueData.complaints);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateThreshold = async () => {
    try {
      setIsUpdatingSettings(true);
      await settingService.updateSettings(threshold);
      // Refresh stats to reflect new threshold
      const [statsData, overdueData] = await Promise.all([
        complaintService.getComplaintStats(),
        complaintService.getComplaints({ isOverdue: true, limit: 5 })
      ]);
      setStats(statsData);
      setCriticalOverdue(overdueData.complaints);
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const statCards = [
    {
      label: 'Total Complaints',
      value: stats?.total ?? '—',
      icon: Users,
      color: 'from-violet-500 to-indigo-500',
      shadow: 'shadow-violet-500/20',
    },
    {
      label: 'Open Issues',
      value: stats?.open ?? '—',
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/20',
    },
    {
      label: 'High Priority',
      value: stats?.highPriority ?? '—',
      icon: Clock,
      color: 'from-red-500 to-rose-500',
      shadow: 'shadow-red-500/20',
    },
    {
      label: 'Resolved',
      value: stats?.resolved ?? '—',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-500',
      shadow: 'shadow-emerald-500/20',
    },
    {
      label: 'Overdue',
      value: stats?.overdue ?? '—',
      icon: AlertCircle,
      color: 'from-pink-600 to-rose-700',
      shadow: 'shadow-pink-500/20',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Greeting */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Shield className="w-5 h-5 text-violet-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-gray-500 text-sm">
          Welcome back, <span className="text-gray-300">{user?.name}</span>. Here's your society overview.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <TrendingUp className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
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
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/complaints')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span>View All Complaints</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-violet-400 transition-colors" />
            </button>
            <button
              disabled
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-gray-400 cursor-not-allowed opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
                <span>Manage Residents</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold">Coming Soon</span>
            </button>
          </div>
        </div>
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Critical Overdue Complaints</h2>
          {criticalOverdue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <CheckCircle2 className="w-12 h-12 mb-3 opacity-20" />
              <p>No critical overdue complaints.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {criticalOverdue.map((complaint) => (
                <div 
                  key={complaint.id}
                  onClick={() => navigate(`/complaints/${complaint.id}`)}
                  className="flex items-center justify-between p-3 rounded-xl bg-red-500/[0.05] border border-red-500/20 hover:bg-red-500/[0.1] transition-colors cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-red-100">{complaint.category}</span>
                    <span className="text-xs text-red-400/70">{format(new Date(complaint.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-red-400/50" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gray-500/10 text-gray-400">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold text-white">System Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Overdue Threshold (Days)
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
                  className="w-full bg-white/[0.02] border border-white/[0.06] text-white text-sm rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none p-3"
                />
                <button
                  onClick={handleUpdateThreshold}
                  disabled={isUpdatingSettings}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  {isUpdatingSettings && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Complaints older than {threshold} days will be marked as overdue.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
