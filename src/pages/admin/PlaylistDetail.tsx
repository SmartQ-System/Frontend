import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { playlistsApi, questionsApi } from '../../lib/api'
import { useThemeStore } from '../../stores/themeStore'
import { FiArrowLeft, FiPlus, FiTrash2, FiSearch, FiCheck } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { useUiStore } from '../../stores/uiStore'

interface Question {
  id: number
  questionText: string
  questionNumber: number
  level: { name: string; color: string } | null
}

interface Playlist {
  id: number
  title: string
  description?: string
  questions: Question[]
}

export default function PlaylistDetailsPage() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const { id } = useParams<{ id: string }>()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([])

  const { openConfirm } = useUiStore()

  const loadPlaylist = async () => {
    try {
      setLoading(true)
      if (!id) return
      const res = await playlistsApi.getOne(parseInt(id))
      setPlaylist(res.data.playlist)
    } catch (error) {
      console.error('Error loading playlist:', error)
      toast.error('فشل تحميل القائمة')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlaylist()
  }, [id])

  const handleRemoveQuestion = (questionId: number) => {
    openConfirm({
      title: 'إزالة السؤال',
      message: 'هل أنت متأكد من إزالة هذا السؤال من القائمة؟',
      confirmLabel: 'إزالة',
      variant: 'danger',
      onConfirm: async () => {
        try {
          if (!id) return
          await playlistsApi.removeQuestion(parseInt(id), questionId)
          toast.success('تم إزالة السؤال')
          loadPlaylist()
        } catch (error) {
          console.error('Error removing question:', error)
          toast.error('فشل الإزالة')
        }
      }
    })
  }

  const loadAvailableQuestions = async () => {
    try {
      setLoadingQuestions(true)
      const res = await questionsApi.getAll({ limit: 100 })
      setAvailableQuestions(res.data.questions)
    } catch (error) {
      console.error('Error loading questions:', error)
      toast.error('فشل تحميل الأسئلة')
    } finally {
      setLoadingQuestions(false)
    }
  }

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true)
    loadAvailableQuestions()
    setSelectedQuestionIds([])
  }

  const handleAddQuestions = async () => {
    try {
      if (!id) return
      
      for (const qId of selectedQuestionIds) {
        await playlistsApi.addQuestion(parseInt(id), qId)
      }
      
      toast.success('تم إضافة الأسئلة بنجاح')
      setIsAddModalOpen(false)
      loadPlaylist()
    } catch (error) {
      console.error('Error adding questions:', error)
      toast.error('فشل إضافة بعض الأسئلة')
    }
  }
  
  const toggleSelection = (qId: number) => {
    if (selectedQuestionIds.includes(qId)) {
      setSelectedQuestionIds(selectedQuestionIds.filter(id => id !== qId))
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, qId])
    }
  }

  const filteredAvailable = availableQuestions.filter(q => 
    !playlist?.questions.some(pq => pq.id === q.id) &&
    q.questionText.includes(searchQuery)
  )

  if (loading) return <div className="text-center py-12 text-theme-muted">جاري التحميل...</div>
  if (!playlist) return <div className="text-center py-12 text-red-500">لم يتم العثور على القائمة</div>

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/playlists" className={`p-2 rounded-lg text-theme-muted hover:text-theme-main transition-colors ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <FiArrowLeft />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-theme-main mb-1">{playlist.title}</h1>
            <p className="text-theme-muted">{playlist.description}</p>
          </div>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus />
          <span>إضافة أسئلة</span>
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className={`p-4 border-b ${isDark ? 'border-gray-700/50' : 'border-gray-200'}`}>
          <h3 className="font-bold text-theme-main">الأسئلة ({playlist.questions.length})</h3>
        </div>
        
        {playlist.questions.length === 0 ? (
          <div className="p-12 text-center text-theme-muted">
            لا توجد أسئلة في هذه القائمة بعد
          </div>
        ) : (
          <div className={`divide-y ${isDark ? 'divide-gray-700/50' : 'divide-gray-200'}`}>
            {playlist.questions.map((q, index) => (
              <div key={q.id} className={`p-4 flex items-center justify-between transition-colors ${isDark ? 'hover:bg-gray-700/20' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-theme-main font-medium mb-1 line-clamp-1">{q.questionText}</h4>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        رقم {q.questionNumber}
                      </span>
                      {q.level && (
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${q.level.color}20`, color: q.level.color }}>
                          {q.level.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveQuestion(q.id)}
                  className="p-2 text-theme-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Questions Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card w-full max-w-2xl h-[80vh] flex flex-col animate-fade-in-up p-0">
            <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-bold text-theme-main mb-4">إضافة أسئلة للقائمة</h2>
              <div className="relative">
                <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted" />
                <input 
                  type="text"
                  placeholder="بحث عن سؤال..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="input-field pr-10"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {loadingQuestions ? (
                <div className="text-center py-8 text-theme-muted">جاري تحميل الأسئلة...</div>
              ) : filteredAvailable.length === 0 ? (
                <div className="text-center py-8 text-theme-muted">لا توجد أسئلة متاحة</div>
              ) : (
                <div className="space-y-2">
                  {filteredAvailable.map(q => (
                    <div 
                      key={q.id} 
                      onClick={() => toggleSelection(q.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        selectedQuestionIds.includes(q.id) 
                          ? 'bg-purple-900/20 border-purple-500/50' 
                          : isDark
                            ? 'bg-gray-900/30 border-gray-700 hover:border-gray-600'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex-1">
                        <p className={`font-medium mb-1 ${selectedQuestionIds.includes(q.id) ? 'text-purple-500' : 'text-theme-body'}`}>
                          {q.questionText}
                        </p>
                        <div className="flex gap-2">
                           <span className="text-xs text-theme-muted">#{q.questionNumber}</span>
                        </div>
                      </div>
                      {selectedQuestionIds.includes(q.id) && (
                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white">
                          <FiCheck size={14} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className={`p-6 border-t flex justify-between items-center ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <span className="text-theme-muted text-sm">
                تم تحديد {selectedQuestionIds.length} سؤال
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddQuestions}
                  disabled={selectedQuestionIds.length === 0}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  إضافة المحدد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
