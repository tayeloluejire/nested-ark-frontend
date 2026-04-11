'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { FileText, Download, ShieldCheck, Loader2 } from 'lucide-react';

export default function ProjectDocuments() {
  const { id } = useParams();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/projects/${id}/documents`)
      .then(res => setDocs(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Technical Archive</h1>
        <p className="text-zinc-500 text-sm mb-12">All verified plans, permits, and audits for Project ID: {id}</p>

        {loading ? <Loader2 className="animate-spin text-teal-500 mx-auto" /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {docs.map((doc: any) => (
              <div key={doc.id} className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-teal-500/10 rounded-xl"><FileText className="text-teal-500" /></div>
                  <div>
                    <p className="text-sm font-bold">{doc.label}</p>
                    <p className="text-[10px] text-zinc-500 uppercase">Verified on Immutable Ledger</p>
                  </div>
                </div>
                <a href={doc.file_url} download className="p-3 hover:bg-zinc-800 rounded-full transition-all"><Download size={18}/></a>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}