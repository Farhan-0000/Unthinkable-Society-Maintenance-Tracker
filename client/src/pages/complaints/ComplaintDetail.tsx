import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/complaintService';
import type { Complaint } from '../../types';
import StatusBadge from '../../components/Complaints/StatusBadge';
import PriorityBadge from '../../components/Complaints/PriorityBadge';
import ComplaintTimeline from '../../components/Complaints/ComplaintTimeline';
import ImageModal from '../../components/Complaints/ImageModal';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, User, Clock, Loader2, Save, Trash2, AlertCircle, Image as ImageIcon, MessageSquare } from 'lucide-react';

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Admin edit states
  const [status, setStatus] = useState<Complaint['status']>('OPEN');
  const [priority, setPriority] = useState<Complaint['priority']>('MEDIUM');
  const [note, setNote] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchComplaint = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError('');
      const data = await complaintService.getComplaint(id);
      setComplaint(data.complaint);
      setStatus(data.complaint.status);
      setPriority(data.complaint.priority);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load complaint');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchComplaint();
  }, [fetchComplaint]);

  const handleUpdate = async () => {
    if (!id || !complaint) return;
    try {
      setIsSaving(true);
      const data = await complaintService.updateComplaint(id, { status, priority, ...(note ? { note } as any : {}) });
      setComplaint(data.complaint);
      setNote('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update complaint');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this complaint?')) return;
    try {
      setIsSaving(true);
      await complaintService.deleteComplaint(id);
      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete complaint');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-violet-500" />
        <p>Loading details...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-4xl mx-auto text-center space-y-6 pt-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500 mb-2">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Complaint Not Found</h2>
        <p className="text-gray-400">{error || 'The requested complaint does not exist.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  const hasChanges = status !== complaint.status || priority !== complaint.priority;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              {complaint.category}
            </h1>
            <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
              <span className="font-mono text-xs opacity-75">#{complaint.id.slice(-6).toUpperCase()}</span>
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            {hasChanges && (
              <button
                onClick={handleUpdate}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 transition-all text-sm font-medium disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col">
            {complaint.photoUrl ? (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-black/40 border-b border-white/[0.08] flex justify-center max-h-[400px] cursor-zoom-in relative group"
              >
                <img
                  src={`http://localhost:5000${complaint.photoUrl}`}
                  alt="Complaint"
                  className="object-contain w-full h-full transition-opacity group-hover:opacity-90"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <span className="bg-black/60 text-white text-sm px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-lg flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> View Full Image
                  </span>
                </div>
              </button>
            ) : (
              <div className="w-full h-48 bg-white/[0.02] border-b border-white/[0.08] flex flex-col items-center justify-center text-gray-500">
                <ImageIcon className="w-10 h-10 mb-2 opacity-30" />
                <span className="text-sm font-medium">No photo provided</span>
              </div>
            )}
            
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>
          </div>

          <ComplaintTimeline history={complaint.history || []} />
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wider mb-4">Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-violet-400 flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Reported by</p>
                  <p className="text-sm font-medium text-gray-200">{complaint.resident?.name}</p>
                  <p className="text-xs text-gray-500">{complaint.resident?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-blue-400 flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Created on</p>
                  <p className="text-sm font-medium text-gray-200">
                    {format(new Date(complaint.createdAt), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Last updated</p>
                  <p className="text-sm font-medium text-gray-200">
                    {format(new Date(complaint.updatedAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-white/[0.08] my-6" />

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-semibold">Status</label>
                {isAdmin ? (
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl focus:ring-2 focus:ring-violet-500/50 p-2.5 outline-none"
                  >
                    <option value="OPEN" className="bg-gray-900">Open</option>
                    <option value="IN_PROGRESS" className="bg-gray-900">In Progress</option>
                    <option value="RESOLVED" className="bg-gray-900">Resolved</option>
                  </select>
                ) : (
                  <div><StatusBadge status={complaint.status} /></div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-semibold">Priority</label>
                {isAdmin ? (
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl focus:ring-2 focus:ring-violet-500/50 p-2.5 outline-none"
                  >
                    <option value="LOW" className="bg-gray-900">Low</option>
                    <option value="MEDIUM" className="bg-gray-900">Medium</option>
                    <option value="HIGH" className="bg-gray-900">High</option>
                  </select>
                ) : (
                  <div><PriorityBadge priority={complaint.priority} /></div>
                )}
              </div>

              {isAdmin && hasChanges && (
                <div className="space-y-2 pt-4 border-t border-white/[0.08]">
                  <label className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Update Note (Optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note explaining this update..."
                    rows={3}
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl focus:ring-2 focus:ring-violet-500/50 p-3 resize-none text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && complaint.photoUrl && (
        <ImageModal 
          imageUrl={`http://localhost:5000${complaint.photoUrl}`} 
          altText="Complaint Attachment" 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}
