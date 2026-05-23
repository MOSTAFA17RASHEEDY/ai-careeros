import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, FileText, Sparkles, X, Save, Trash2, ChevronRight,
  Building2, GraduationCap, Wrench, FolderGit2, UserSquare2,
  PlusCircle, Check,
} from 'lucide-react'
import { api, API_BASE, type Resume, type ResumeSections, type Skill } from '../lib/api'

function genId() { return Math.random().toString(36).slice(2, 10) }

const emptySections = (): ResumeSections => ({
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
})

function parseSections(resume: Resume): ResumeSections {
  if (!resume.content) return emptySections()
  try {
    const s = JSON.parse(resume.content)
    return { ...emptySections(), ...s }
  } catch {
    return { ...emptySections(), summary: resume.content }
  }
}

interface NewResumeModalProps {
  open: boolean
  onClose: () => void
  onCreate: (title: string, target: string) => Promise<void>
}

function NewResumeModal({ open, onClose, onCreate }: NewResumeModalProps) {
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !target.trim()) return
    setBusy(true)
    try {
      await onCreate(title.trim(), target.trim())
      setTitle(''); setTarget('')
      onClose()
    } catch { } finally { setBusy(false) }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 bg-black/20 z-50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:top-1/3 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/3 z-50 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">New Resume</h2>
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Title</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Software Engineer Resume"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Target Role / Company</label>
                <input
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  placeholder="e.g. Senior Engineer at Google"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={!title.trim() || !target.trim() || busy}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 transition-colors"
              >
                {busy ? 'Creating...' : 'Create'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 bg-black/20 z-50" onClick={onCancel} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:top-1/3 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/3 z-50 md:w-80 bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
          >
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-2">{message}</p>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
              <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">{confirmLabel}</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function SectionCard({ label, icon: Icon, children, onAiImprove, aiBusy }: {
  label: string; icon: any; children: React.ReactNode; onAiImprove?: () => void; aiBusy?: boolean
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-900">{label}</span>
        </div>
        {onAiImprove && (
          <button
            onClick={onAiImprove}
            disabled={aiBusy}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-purple-600 hover:bg-purple-50 disabled:opacity-40 transition-colors"
          >
            <Sparkles size={12} />
            {aiBusy ? 'Improving...' : 'AI Improve'}
          </button>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

export function ResumeBuilder() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Resume | null>(null)
  const [sections, setSections] = useState<ResumeSections>(emptySections())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [aiBusySection, setAiBusySection] = useState<string | null>(null)
  const [userSkills, setUserSkills] = useState<Skill[]>([])

  const loadList = useCallback(() => {
    api.resumes.list().then(setResumes).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadList() }, [loadList])

  useEffect(() => { api.skills.list().then(setUserSkills).catch(() => {}) }, [])

  const loadDetail = useCallback(async (id: string) => {
    const r = await api.resumes.get(id)
    setSelected(r)
    setSections(parseSections(r as Resume))
    setDirty(false)
  }, [])

  useEffect(() => {
    if (!selectedId) { setSelected(null); return }
    loadDetail(selectedId)
  }, [selectedId, loadDetail])

  const saveSections = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await api.resumes.update(selected.id, {
        content: JSON.stringify(sections),
        score: Math.min(100, (sections.skills?.length || 0) * 10 + (sections.experience?.length || 0) * 15 + (sections.projects?.length || 0) * 10),
      })
      setDirty(false)
      loadList()
    } catch {} finally { setSaving(false) }
  }

  const updateSection = (key: keyof ResumeSections, value: any) => {
    setSections(prev => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  const handleCreate = async (title: string, target: string) => {
    const created = await api.resumes.create({ title, target })
    setResumes(prev => [created, ...prev])
    setSelectedId(created.id)
  }

  const handleDelete = async () => {
    if (!selected) return
    try {
      await api.resumes.delete(selected.id)
      setShowDeleteConfirm(false)
      if (selectedId === selected.id) setSelectedId(null)
      loadList()
    } catch {}
  }

  const handleAiImprove = async (section: keyof ResumeSections) => {
    if (!selected) return
    setAiBusySection(section)
    try {
      const token = localStorage.getItem('token')
      const currentData = sections[section]
      const payload = JSON.stringify({
        text: `Improve the "${section}" section of my resume for the target role "${selected.target}". Current content: ${JSON.stringify(currentData)}. Return ONLY the raw improved value for this section in JSON format, wrapped in \`\`\`json ... \`\`\`. Do NOT wrap it in an object with the section name.`,
        conversationId: undefined,
      })
      const res = await fetch(`${API_BASE}/ai/orchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: payload,
      })
      if (!res.ok) return
      const result = await res.json()

      const parse = (raw: string): any => {
        const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
        const json = match ? match[1].trim() : raw.trim()
        return JSON.parse(json)
      }

      let improved: any
      try { improved = parse(result.text) } catch { return }

      if (typeof improved === 'object' && improved !== null && !Array.isArray(improved)) {
        const val = improved[section]
        if (val !== undefined) improved = val
      }

      updateSection(section, improved)
    } catch {} finally { setAiBusySection(null) }
  }

  const selectedForDelete = selected

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>

  return (
    <div className="max-w-6xl">
      <NewResumeModal open={showNewModal} onClose={() => setShowNewModal(false)} onCreate={handleCreate} />
      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete Resume"
        message={`Are you sure you want to delete "${selectedForDelete?.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resumes</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage structured resumes that the AI can read and improve.</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          New Resume
        </button>
      </div>

      <div className="flex gap-6">
        {/* Resume List */}
        <div className="w-72 shrink-0 space-y-2">
          {resumes.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <FileText size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No resumes yet.</p>
            </div>
          )}
          {resumes.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              className={`w-full text-left rounded-xl border p-4 transition-all ${
                selectedId === r.id ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{r.title}</div>
                  <div className="text-xs text-gray-500 truncate">{r.target}</div>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                    <span>Score: {r.score}%</span>
                    <span>v{r.versions}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-300 mt-1" />
              </div>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="flex-1 min-w-0">
          {!selected ? (
            <div className="text-center py-20 text-gray-400">
              <FileText size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a resume to edit, or create a new one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Title bar */}
              <div className="flex items-center justify-between">
                <div>
                  <input
                    value={selected.title}
                    onChange={e => {
                      setSelected({ ...selected, title: e.target.value })
                      setDirty(true)
                    }}
                    className="text-xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0 p-0"
                  />
                  <input
                    value={selected.target}
                    onChange={e => {
                      setSelected({ ...selected, target: e.target.value })
                      setDirty(true)
                    }}
                    className="text-sm text-gray-500 bg-transparent border-none outline-none focus:ring-0 p-0 mt-0.5 block"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveSections}
                    disabled={!dirty || saving}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 transition-colors"
                  >
                    <Save size={14} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>

              {/* Sections */}
              <SectionCard label="Summary" icon={UserSquare2} onAiImprove={() => handleAiImprove('summary')} aiBusy={aiBusySection === 'summary'}>
                <textarea
                  value={sections.summary || ''}
                  onChange={e => updateSection('summary', e.target.value)}
                  placeholder="Professional summary highlighting your key qualifications..."
                  rows={4}
                  className="w-full text-sm text-gray-900 bg-transparent border border-gray-200 rounded-lg p-3 resize-y focus:outline-none focus:border-gray-400"
                />
              </SectionCard>

              <SectionCard label="Experience" icon={Building2} onAiImprove={() => handleAiImprove('experience')} aiBusy={aiBusySection === 'experience'}>
                <div className="space-y-3">
                  {(sections.experience || []).map((exp, i) => (
                    <div key={exp.id || `exp-${i}`} className="relative rounded-lg border border-gray-200 p-3">
                      <button
                        onClick={() => updateSection('experience', (sections.experience || []).filter((_, idx) => idx !== i))}
                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors"
                      ><X size={14} /></button>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input value={exp.company} onChange={e => {
                          const list = [...(sections.experience || [])]
                          list[i] = { ...list[i], company: e.target.value }
                          updateSection('experience', list)
                        }} placeholder="Company" className="px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-gray-400" />
                        <input value={exp.role} onChange={e => {
                          const list = [...(sections.experience || [])]
                          list[i] = { ...list[i], role: e.target.value }
                          updateSection('experience', list)
                        }} placeholder="Role" className="px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-gray-400" />
                      </div>
                      <input value={exp.duration} onChange={e => {
                        const list = [...(sections.experience || [])]
                        list[i] = { ...list[i], duration: e.target.value }
                        updateSection('experience', list)
                      }} placeholder="Duration (e.g. Jan 2020 - Present)" className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md mb-2 focus:outline-none focus:border-gray-400" />
                      <textarea
                        value={exp.description}
                        onChange={e => {
                          const list = [...(sections.experience || [])]
                          list[i] = { ...list[i], description: e.target.value }
                          updateSection('experience', list)
                        }}
                        placeholder="Describe your responsibilities and achievements..."
                        rows={3}
                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md resize-y focus:outline-none focus:border-gray-400"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => updateSection('experience', [...(sections.experience || []), { id: genId(), company: '', role: '', duration: '', description: '' }])}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <PlusCircle size={14} /> Add Experience
                  </button>
                </div>
              </SectionCard>

              <SectionCard label="Education" icon={GraduationCap} onAiImprove={() => handleAiImprove('education')} aiBusy={aiBusySection === 'education'}>
                <div className="space-y-3">
                  {(sections.education || []).map((edu, i) => (
                    <div key={edu.id || `edu-${i}`} className="relative rounded-lg border border-gray-200 p-3">
                      <button
                        onClick={() => updateSection('education', (sections.education || []).filter((_, idx) => idx !== i))}
                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors"
                      ><X size={14} /></button>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input value={edu.school} onChange={e => {
                          const list = [...(sections.education || [])]
                          list[i] = { ...list[i], school: e.target.value }
                          updateSection('education', list)
                        }} placeholder="School" className="px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-gray-400" />
                        <input value={edu.degree} onChange={e => {
                          const list = [...(sections.education || [])]
                          list[i] = { ...list[i], degree: e.target.value }
                          updateSection('education', list)
                        }} placeholder="Degree" className="px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-gray-400" />
                      </div>
                      <input value={edu.year} onChange={e => {
                        const list = [...(sections.education || [])]
                        list[i] = { ...list[i], year: e.target.value }
                        updateSection('education', list)
                      }} placeholder="Year" className="px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-gray-400" />
                    </div>
                  ))}
                  <button
                    onClick={() => updateSection('education', [...(sections.education || []), { id: genId(), school: '', degree: '', year: '' }])}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <PlusCircle size={14} /> Add Education
                  </button>
                </div>
              </SectionCard>

              <SectionCard label="Skills" icon={Wrench} onAiImprove={() => handleAiImprove('skills')} aiBusy={aiBusySection === 'skills'}>
                <div className="space-y-3">
                  {/* Resume skills */}
                  <div className="flex flex-wrap gap-2">
                      {(sections.skills || []).map((skill, i) => (
                        <span key={`skill-${i}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-700">
                          {skill}
                        <button
                          onClick={() => updateSection('skills', (sections.skills || []).filter((_, idx) => idx !== i))}
                          className="text-gray-400 hover:text-red-500"
                        ><X size={12} /></button>
                      </span>
                    ))}
                  </div>

                  {/* Tracked skills from collection */}
                  {userSkills.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Your Skills</div>
                      <div className="flex flex-wrap gap-1.5">
                        {userSkills.map((s) => {
                          const onResume = (sections.skills || []).some(sk => sk.toLowerCase() === s.name.toLowerCase())
                          return (
                            <button
                              key={s.name}
                              onClick={() => {
                                if (onResume) {
                                  updateSection('skills', (sections.skills || []).filter(sk => sk.toLowerCase() !== s.name.toLowerCase()))
                                } else {
                                  updateSection('skills', [...(sections.skills || []), s.name])
                                }
                              }}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                                onResume ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              {onResume ? <Check size={10} /> : <Plus size={10} />}
                              {s.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Add skill input */}
                  <input
                    placeholder="Add skill..."
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                        updateSection('skills', [...(sections.skills || []), (e.target as HTMLInputElement).value.trim()])
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
              </SectionCard>

              <SectionCard label="Projects" icon={FolderGit2} onAiImprove={() => handleAiImprove('projects')} aiBusy={aiBusySection === 'projects'}>
                <div className="space-y-3">
                  {(sections.projects || []).map((proj, i) => (
                    <div key={proj.id || `proj-${i}`} className="relative rounded-lg border border-gray-200 p-3">
                      <button
                        onClick={() => updateSection('projects', (sections.projects || []).filter((_, idx) => idx !== i))}
                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors"
                      ><X size={14} /></button>
                      <input value={proj.name} onChange={e => {
                        const list = [...(sections.projects || [])]
                        list[i] = { ...list[i], name: e.target.value }
                        updateSection('projects', list)
                      }} placeholder="Project name" className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md mb-2 focus:outline-none focus:border-gray-400" />
                      <textarea
                        value={proj.description}
                        onChange={e => {
                          const list = [...(sections.projects || [])]
                          list[i] = { ...list[i], description: e.target.value }
                          updateSection('projects', list)
                        }}
                        placeholder="Project description..."
                        rows={2}
                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md resize-y focus:outline-none focus:border-gray-400"
                      />
                      <input value={proj.link || ''} onChange={e => {
                        const list = [...(sections.projects || [])]
                        list[i] = { ...list[i], link: e.target.value }
                        updateSection('projects', list)
                      }} placeholder="Link (optional)" className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md mt-2 focus:outline-none focus:border-gray-400" />
                    </div>
                  ))}
                  <button
                    onClick={() => updateSection('projects', [...(sections.projects || []), { id: genId(), name: '', description: '', link: '' }])}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <PlusCircle size={14} /> Add Project
                  </button>
                </div>
              </SectionCard>

              {dirty && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm">
                  <span className="text-amber-700">Unsaved changes</span>
                  <div className="flex gap-2">
                    <button onClick={() => loadDetail(selected.id)} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">Discard</button>
                    <button onClick={saveSections} className="px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors">Save</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
