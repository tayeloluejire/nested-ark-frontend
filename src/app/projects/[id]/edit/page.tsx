'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

export default function EditProject() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await api.get(`/projects/${id}`);
        setForm(res.data);
      } catch (err) {
        console.error("Failed to load project for editing", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProject();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/projects/${id}`, form);
      router.push('/projects/my');
    } catch (err) {
      alert("Update failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-teal-500" /></div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-teal-500/30">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-20">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-all">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Edit Project</h1>
        <p className="text-zinc-500 mb-10 text-sm">Update your project specifications and requirements.</p>

        <form onSubmit={handleUpdate} className="space-y-6 bg-zinc-900/30 p-8 rounded-3xl border border-zinc-800">
          <div>
            <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Project Title</label>
            <input 
              value={form?.title || ''} 
              onChange={e => setForm({...form, title: e.target.value})}
              className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm focus:border-teal-500 outline-none transition-all"
            />
          </div>
          {/* Add other fields here similar to your submit page */}
          
          <button type="submit" disabled={submitting} className="w-full py-4 bg-teal-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Save Changes</>}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}