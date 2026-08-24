import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Image as ImageIcon, Upload, X, ArrowLeft, Loader2 } from 'lucide-react';
import { complaintService } from '../../services/complaintService';

export default function CreateComplaint() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Cleaning',
    'Security',
    'Other',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError('');
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!category || !description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('category', category);
      formData.append('description', description);
      formData.append('priority', priority);
      if (file) {
        formData.append('photo', file);
      }

      await complaintService.createComplaint(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create complaint');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">New Complaint</h1>
          <p className="text-gray-500 text-sm">Submit a maintenance request</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Category *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-gray-500" />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 block pl-10 p-3 appearance-none"
              >
                <option value="" disabled className="bg-gray-900 text-gray-500">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-gray-900 text-white">{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 block p-3 appearance-none"
            >
              <option value="LOW" className="bg-gray-900 text-white">Low</option>
              <option value="MEDIUM" className="bg-gray-900 text-white">Medium</option>
              <option value="HIGH" className="bg-gray-900 text-white">High</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            placeholder="Please describe the issue in detail..."
            className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 block p-3 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Photo (Optional)</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/[0.08] border-dashed rounded-xl hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
            {previewUrl ? (
              <div className="relative w-full max-w-sm">
                <img src={previewUrl} alt="Preview" className="rounded-lg object-cover w-full h-48" />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-center cursor-pointer w-full" onClick={() => fileInputRef.current?.click()}>
                <div className="mx-auto h-12 w-12 text-gray-400 bg-white/[0.04] rounded-full flex items-center justify-center mb-4">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <div className="flex text-sm text-gray-400 justify-center">
                  <span className="relative rounded-md font-semibold text-violet-400 hover:text-violet-300 focus-within:outline-none">
                    <span>Upload a file</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleFileChange}
                    />
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-violet-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Submit Complaint
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
