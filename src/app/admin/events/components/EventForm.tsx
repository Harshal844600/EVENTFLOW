"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EventForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiImageLoading, setAiImageLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    venue: initialData?.venue || "",
    startTime: initialData?.startTime ? new Date(initialData.startTime).toISOString().slice(0,16) : "",
    endTime: initialData?.endTime ? new Date(initialData.endTime).toISOString().slice(0,16) : "",
    price: initialData?.price || 0,
    capacity: initialData?.capacity || 100,
    status: initialData?.status || "DRAFT",
    bannerUrl: initialData?.bannerUrl || "",
    aiGeneratedDescription: initialData?.aiGeneratedDescription || false,
  });

  const handleAiEnhance = async () => {
    if (!formData.description || formData.description.length < 10) {
      toast.error("Please write a bit more before enhancing.");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/enhance-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: formData.description }),
      });
      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ 
          ...prev, 
          description: data.enhancedDescription,
          aiGeneratedDescription: true
        }));
      } else {
        toast.error(data.error || "Failed to enhance description");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error contacting AI");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiImageGenerate = () => {
    if (!formData.title) {
      toast.error("Please enter an event title first to generate an image.");
      return;
    }
    setAiImageLoading(true);
    
    const prompt = `A professional, high-quality event promotional banner for an event titled "${formData.title}". ${formData.category ? formData.category + ' event.' : ''} ${formData.description ? formData.description.substring(0, 50) : ""} abstract, high resolution, cinematic lighting, no text`;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1200&height=600&nologo=true&seed=${Math.floor(Math.random() * 10000)}`;
    
    setFormData(prev => ({ ...prev, bannerUrl: imageUrl }));
    setImageFile(null); // Clear any manually uploaded file
    setAiImageLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent, targetStatus?: "DRAFT" | "PUBLISHED" | "CANCELLED") => {
    if (e) e.preventDefault();
    setLoading(true);
    
    try {
      let finalBannerUrl = formData.bannerUrl;
      const statusToUse = targetStatus || formData.status;

      // Handle image upload first if a new file is selected
      if (imageFile) {
        setUploadingImage(true);
        const presignRes = await fetch("/api/upload/presigned-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            filename: imageFile.name, 
            contentType: imageFile.type 
          }),
        });

        if (!presignRes.ok) throw new Error("Failed to get presigned URL");
        
        const { presignedUrl, finalUrl } = await presignRes.json();

        // Upload directly to S3
        const uploadRes = await fetch(presignedUrl, {
          method: "PUT",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });

        if (!uploadRes.ok) throw new Error("Failed to upload image to S3");
        
        finalBannerUrl = finalUrl;
        setUploadingImage(false);
      }

      // Submit event data
      const payload = { ...formData, status: statusToUse, bannerUrl: finalBannerUrl };

      const res = await fetch(initialData ? `/api/events/${initialData.id}` : "/api/events", {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(initialData ? "Event updated successfully" : "Event created successfully");
        router.push("/admin/events");
        router.refresh();
      } else {
        const errorText = await res.text();
        toast.error(`Failed to save event: ${errorText}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`Error saving event: ${err.message || "Unknown error"}`);
      setUploadingImage(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
      // If user edits description manually, remove AI flag
      ...(name === "description" ? { aiGeneratedDescription: false } : {})
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card-bg p-8 border border-card-border rounded shadow-xl text-foreground">
      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <div className="flex justify-between items-end mb-2">
            <label className="block text-secondary text-sm font-bold">Event Banner Image</label>
            <button
              type="button"
              onClick={handleAiImageGenerate}
              disabled={aiImageLoading}
              className="text-xs font-bold bg-background text-foreground px-3 py-1 rounded shadow-sm hover:scale-105 transition-transform disabled:opacity-50 flex items-center space-x-1"
            >
              <span>🎨</span>
              <span>{aiImageLoading ? "Generating..." : "Generate with AI"}</span>
            </button>
          </div>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full bg-background border border-card-border rounded p-3 text-foreground focus:outline-none focus:border-yellow transition-colors file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-bold file:bg-primary file:text-foreground hover:file:bg-secondary transition-colors"
          />
          {formData.bannerUrl && !imageFile && (
            <div className="mt-4">
              <p className="text-xs mb-2 text-secondary">Current banner preview:</p>
              <img src={formData.bannerUrl} alt="Banner Preview" className="w-full max-h-64 object-cover rounded border border-card-border" />
            </div>
          )}
        </div>

        <div className="col-span-2">
          <label className="block text-secondary text-sm font-bold mb-2">Event Title</label>
          <input 
            required type="text" name="title" value={formData.title} onChange={handleChange}
            className="w-full bg-background border border-card-border rounded p-3 text-foreground focus:outline-none focus:border-yellow transition-colors"
          />
        </div>
        
        <div className="col-span-2 relative">
          <div className="flex justify-between items-end mb-2">
            <label className="block text-secondary text-sm font-bold">Description</label>
            <button
              type="button"
              onClick={handleAiEnhance}
              disabled={aiLoading}
              className="text-xs font-bold bg-background text-foreground px-3 py-1 rounded shadow-sm hover:scale-105 transition-transform disabled:opacity-50 flex items-center space-x-1"
            >
              <span>✨</span>
              <span>{aiLoading ? "Enhancing..." : "Enhance with AI"}</span>
            </button>
          </div>
          <textarea 
            required name="description" value={formData.description} onChange={handleChange} rows={6}
            className="w-full bg-background border border-card-border rounded p-3 text-foreground focus:outline-none focus:border-yellow transition-colors"
          />
          {formData.aiGeneratedDescription && (
            <span className="absolute bottom-4 right-4 text-xs font-bold text-primary bg-card-bg/80 px-2 py-1 rounded">
              AI Enhanced
            </span>
          )}
        </div>

        <div>
          <label className="block text-secondary text-sm font-bold mb-2">Category</label>
          <input 
            required type="text" name="category" value={formData.category} onChange={handleChange}
            className="w-full bg-background border border-card-border rounded p-3 text-foreground focus:outline-none focus:border-yellow transition-colors"
          />
        </div>

        <div>
          <label className="block text-secondary text-sm font-bold mb-2">Venue</label>
          <input 
            required type="text" name="venue" value={formData.venue} onChange={handleChange}
            className="w-full bg-background border border-card-border rounded p-3 text-foreground focus:outline-none focus:border-yellow transition-colors"
          />
        </div>

        <div>
          <label className="block text-secondary text-sm font-bold mb-2">Start Time</label>
          <input 
            required type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange}
            className="w-full bg-background border border-card-border rounded p-3 text-foreground focus:outline-none focus:border-yellow transition-colors"
          />
        </div>

        <div>
          <label className="block text-secondary text-sm font-bold mb-2">End Time</label>
          <input 
            required type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange}
            className="w-full bg-background border border-card-border rounded p-3 text-foreground focus:outline-none focus:border-yellow transition-colors"
          />
        </div>

        <div>
          <label className="block text-secondary text-sm font-bold mb-2">Price (0 for free)</label>
          <input 
            required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange}
            className="w-full bg-background border border-card-border rounded p-3 text-foreground focus:outline-none focus:border-yellow transition-colors"
          />
        </div>

        <div>
          <label className="block text-secondary text-sm font-bold mb-2">Capacity</label>
          <input 
            required type="number" name="capacity" value={formData.capacity} onChange={handleChange}
            className="w-full bg-background border border-card-border rounded p-3 text-foreground focus:outline-none focus:border-yellow transition-colors"
          />
        </div>
        
      </div>

      <div className="pt-8 border-t border-card-border/30 flex justify-end space-x-4">
        {formData.status === "PUBLISHED" ? (
          <>
            <button 
              type="button"
              onClick={(e) => {
                setFormData(prev => ({ ...prev, status: "DRAFT" }));
                handleSubmit(e, "DRAFT");
              }}
              disabled={loading || uploadingImage}
              className="bg-background border border-card-border hover:bg-foreground/5 text-foreground px-6 py-3 font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 text-sm cursor-pointer"
            >
              {loading ? "Saving..." : "Revoke (Draft)"}
            </button>
            <button 
              type="button"
              onClick={(e) => {
                handleSubmit(e, "PUBLISHED");
              }}
              disabled={loading || uploadingImage}
              className="bg-primary text-foreground px-8 py-3 font-bold uppercase tracking-wider rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 text-sm cursor-pointer shadow-lg hover:shadow-primary/20"
            >
              {uploadingImage ? "Uploading Image..." : loading ? "Updating..." : "Update Event"}
            </button>
          </>
        ) : (
          <>
            <button 
              type="button"
              onClick={(e) => {
                setFormData(prev => ({ ...prev, status: "DRAFT" }));
                handleSubmit(e, "DRAFT");
              }}
              disabled={loading || uploadingImage}
              className="bg-background border border-card-border hover:bg-foreground/5 text-foreground px-6 py-3 font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 text-sm cursor-pointer"
            >
              {loading ? "Saving..." : "Save as Draft"}
            </button>
            <button 
              type="button"
              onClick={(e) => {
                setFormData(prev => ({ ...prev, status: "PUBLISHED" }));
                handleSubmit(e, "PUBLISHED");
              }}
              disabled={loading || uploadingImage}
              className="bg-primary text-foreground px-8 py-3 font-bold uppercase tracking-wider rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 text-sm cursor-pointer shadow-lg hover:shadow-primary/20"
            >
              {uploadingImage ? "Uploading Image..." : loading ? "Publishing..." : "Publish Event"}
            </button>
          </>
        )}
      </div>
    </form>
  );
}
