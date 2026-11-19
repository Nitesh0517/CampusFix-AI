import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { AICard } from '../components/AICard';
import { 
  Building2, Sparkles, UploadCloud, X, AlertCircle, 
  CheckCircle2, Camera, MapPin, Tag, AlertTriangle, ArrowRight, FileText
} from 'lucide-react';

const CATEGORIES = [
  "Hostel",
  "Internet/Wi-Fi",
  "Electricity",
  "Water Supply",
  "Classroom",
  "Library",
  "Mess/Food",
  "Cleanliness",
  "Infrastructure",
  "Security",
  "Other"
];

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const LOCATIONS = [
  "Hostel 12",
  "Hostel 14",
  "Hostel 15",
  "Hostel 16",
  "Lecture Hall Complex (LHC)",
  "Central Library",
  "Main Building",
  "Computer Science Dept",
  "Electrical Engineering Dept",
  "Mechanical Engineering Dept",
  "Gymkhana Grounds",
  "Student Activity Center (SAC)",
  "Hostel 12 Mess",
  "Hostel 14 Mess",
  "Staff Quarters",
  "Campus Health Center",
  "Other Campus Area"
];

export const ReportComplaintPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Internet/Wi-Fi',
    campus_location: 'Hostel 14',
    building_block: '',
    priority: 'Medium',
    image_url: '',
    ai_summary: '',
    ai_suggested_category: '',
    ai_suggested_priority: '',
  });

  // AI State
  const [aiData, setAiData] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiApplied, setAiApplied] = useState(false);
  const [aiError, setAiError] = useState('');

  // Image Upload State
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Trigger AI Analysis
  const handleAnalyzeAI = async () => {
    if (!formData.description || formData.description.length < 5) {
      setAiError('Please enter at least a few words describing the issue first.');
      return;
    }
    setAiError('');
    setAiAnalyzing(true);
    setAiApplied(false);

    try {
      const res = await api.post('/ai/analyze', {
        description: formData.description,
        title: formData.title,
        campus_location: formData.campus_location
      });
      setAiData(res.data);
    } catch (err) {
      console.warn('AI analysis error', err);
      setAiError('AI engine unavailable. You can manually choose category and priority.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Apply AI suggestions to form fields
  const handleApplyAISuggestions = () => {
    if (!aiData) return;
    setFormData((prev) => ({
      ...prev,
      category: aiData.category || prev.category,
      priority: aiData.priority || prev.priority,
      ai_summary: aiData.summary || '',
      ai_suggested_category: aiData.category,
      ai_suggested_priority: aiData.priority,
      // If AI detected a location and user didn't specify one specifically
      campus_location: aiData.location_hint && LOCATIONS.includes(aiData.location_hint) ? aiData.location_hint : prev.campus_location,
      building_block: prev.building_block || (aiData.location_hint && !LOCATIONS.includes(aiData.location_hint) ? aiData.location_hint : prev.building_block),
    }));
    setAiApplied(true);
  };

  // Handle Image Selection
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size should be under 5MB.');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));

    // Upload to backend immediately
    setUploadingImage(true);
    const uploadForm = new FormData();
    uploadForm.append('file', file);

    try {
      const res = await api.post('/complaints/upload-image', uploadForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, image_url: res.data.image_url }));
    } catch (err) {
      console.error('Image upload failed', err);
      setFormError('Failed to upload image. Please try again or submit without an image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Complaint title is required.');
      return;
    }
    if (!formData.description.trim() || formData.description.length < 5) {
      setFormError('Please provide a detailed description (min 5 characters).');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/complaints', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        campus_location: formData.campus_location,
        building_block: formData.building_block || null,
        priority: formData.priority,
        image_url: formData.image_url || null,
        ai_summary: formData.ai_summary || null,
        ai_suggested_category: formData.ai_suggested_category || null,
        ai_suggested_priority: formData.ai_suggested_priority || null,
      });

      // Redirect to the newly created complaint details page
      navigate(`/complaints/${res.data.id}`);
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to submit complaint. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Report a Campus Issue</h1>
          <p className="text-sm text-slate-500">
            Submit facility defects, hazards, or equipment failures with AI auto-triage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            AI Assistant Active
          </span>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-700">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Description & AI Analysis */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              1. Issue Details & Description
            </label>
            <span className="text-xs text-slate-400">Required</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Short Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Hostel 14 Wi-Fi flapping / Water cooler leaking near LHC 204"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600">
                Detailed Description
              </label>
              <button
                type="button"
                onClick={handleAnalyzeAI}
                disabled={aiAnalyzing || !formData.description.trim()}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {aiAnalyzing ? (
                  <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                )}
                <span>Run AI Triage Assistant</span>
              </button>
            </div>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the problem clearly. Mention symptoms, exact floor/room, and any hazards..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* AI Helper trigger button if not run yet */}
          {!aiData && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs">
              <div className="flex items-center gap-2 text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Want AI to automatically detect category, urgency, and generate a brief summary?</span>
              </div>
              <button
                type="button"
                onClick={handleAnalyzeAI}
                disabled={aiAnalyzing || !formData.description.trim()}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {aiAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
              </button>
            </div>
          )}

          {aiError && (
            <div className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              {aiError}
            </div>
          )}

          {/* AI Triage Result Card */}
          {aiData && (
            <AICard
              aiData={aiData}
              onApply={handleApplyAISuggestions}
              applied={aiApplied}
            />
          )}
        </div>

        {/* Step 2: Categorization & Location (Editable by Student) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-indigo-600" />
            2. Category & Urgency Classification
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Priority / Urgency
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Campus Location
              </label>
              <select
                value={formData.campus_location}
                onChange={(e) => setFormData({ ...formData, campus_location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Building / Block / Room (Optional)
              </label>
              <input
                type="text"
                value={formData.building_block}
                onChange={(e) => setFormData({ ...formData, building_block: e.target.value })}
                placeholder="e.g. Wing B - 3rd Floor / Room 204"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Photographic Evidence Upload */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-indigo-600" />
              3. Photographic Evidence (Optional)
            </label>
            <span className="text-xs text-slate-400">JPG, PNG, WebP up to 5MB</span>
          </div>

          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-w-sm">
              <img
                src={imagePreview}
                alt="Complaint evidence preview"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
              {uploadingImage && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center text-white text-xs font-semibold">
                  Uploading to server...
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-3xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-slate-800">
                Click to browse or drag and drop photo
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Visual proof helps campus technicians diagnose faults before arriving on site.
              </p>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || uploadingImage}
            className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center gap-2 active:scale-98 disabled:opacity-70"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Submit Complaint Ticket</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
