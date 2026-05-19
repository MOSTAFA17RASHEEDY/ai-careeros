import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, FileText, ChevronRight, TrendingUp } from 'lucide-react'
import { api, type Resume } from '../lib/api'

export function ResumeBuilder() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.resumes.list()
      .then(setResumes)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    const title = prompt('Resume title:')
    if (!title) return
    const target = prompt('Target company/role:')
    if (!target) return
    try {
      const created = await api.resumes.create({ title, target })
      setResumes((prev) => [created, ...prev])
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create')
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this resume?')) return
    try {
      await api.resumes.delete(id)
      setResumes((prev) => prev.filter((r) => r.id !== id))
      if (selectedId === id) setSelectedId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  if (loading) return <div className="text-sm text-gray-500">Loading resumes...</div>

  return (
    <div className="max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resumes</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage AI-personalized resumes.</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          New Resume
        </button>
      </motion.div>

      {resumes.length === 0 && (
        <div className="mt-16 text-center">
          <FileText size={40} className="mx-auto text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">No resumes yet. Click "New Resume" to create one.</p>
        </div>
      )}

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        {resumes.map((resume, i) => (
          <motion.div
            key={resume.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * i }}
            onClick={() => setSelectedId(selectedId === resume.id ? null : resume.id)}
            className={`rounded-xl border p-5 cursor-pointer transition-all ${
              selectedId === resume.id
                ? 'border-gray-900 ring-1 ring-gray-900'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{resume.title}</div>
                  <div className="text-xs text-gray-500">{resume.target}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                <TrendingUp size={14} />
                {resume.score}%
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
              <span>{resume.updated}</span>
              <span>{resume.versions} version{resume.versions > 1 ? 's' : ''}</span>
            </div>
            {selectedId === resume.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-4 pt-4 border-t border-gray-100 flex gap-3"
              >
                <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                  Open Resume <ChevronRight size={16} />
                </button>
                <button
                  onClick={(e) => handleDelete(resume.id, e)}
                  className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                >
                  Delete
                </button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
