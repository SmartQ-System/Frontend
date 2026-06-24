import { useState, useEffect } from 'react'
import { questionsApi, levelsApi, categoriesApi } from '../../lib/api'
import { useTableHeight } from '../../hooks/useTableHeight'
import { useThemeStore } from '../../stores/themeStore'
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiSearch } from 'react-icons/fi'
import Select from '../../components/ui/Select'
import { toast } from 'react-hot-toast'
import { useUiStore } from '../../stores/uiStore'

interface Question {
  id: number
  questionNumber: number
  questionText: string
  correctAnswer: string
  option2: string
  option3: string
  option4: string
  level?: { id: number; name: string; color: string }
  categories?: { id: number; name: string }[]
}

interface Level {
  id: number
  name: string
  nameEn: string
  color: string
}

interface Category {
  id: number
  name: string
}

export default function QuestionsPage() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [questions, setQuestions] = useState<Question[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [loading, setLoading] = useState(true)
  const [filterLevel, setFilterLevel] = useState<number | ''>('')
  const [filterCategory, setFilterCategory] = useState<number | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [showModal, setShowModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [formData, setFormData] = useState({
    questionText: '',
    correctAnswer: '',
    option2: '',
    option3: '',
    option4: '',
    levelId: '' as number | '',
    categoryId: '' as number | '',
    questionNumber: 0
  })

  const { openConfirm } = useUiStore()

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { containerRef, limit } = useTableHeight(70, 50)

  useEffect(() => {
    loadData()
  }, [filterLevel, filterCategory, page, limit])

  const loadData = async () => {
    try {
      setLoading(true)
      const [questionsRes, levelsRes, categoriesRes] = await Promise.all([
        questionsApi.getAll({
          page,
          limit,
          levelId: filterLevel || undefined,
          categoryId: filterCategory || undefined,
        }),
        levelsApi.getAll(),
        categoriesApi.getAll(),
      ])
      setQuestions(questionsRes.data.questions || [])
      setTotalPages(questionsRes.data.pagination?.totalPages || 1)
      setLevels(levelsRes.data.levels || [])
      setCategories(categoriesRes.data.categories || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('فشل تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = (id: number) => {
    openConfirm({
      title: 'حذف السؤال',
      message: 'هل أنت متأكد من رغبتك في حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.',
      confirmLabel: 'حذف',
      variant: 'danger',
      onConfirm: () => handleDelete(id),
    })
  }

  const handleDelete = async (id: number) => {
    try {
      await questionsApi.delete(id)
      setQuestions(questions.filter(q => q.id !== id))
      toast.success('تم حذف السؤال بنجاح')
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('فشل حذف السؤال')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const toastId = toast.loading('جارٍ رفع الملف...')

    try {
      setLoading(true)
      await questionsApi.bulkUpload(file)
      toast.success('تم رفع الأسئلة بنجاح', { id: toastId })
      loadData()
    } catch (error: any) {
      console.error('Error uploading file:', error)
      toast.error(error.response?.data?.message || 'فشل رفع الملف', { id: toastId })
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === questions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(questions.map(q => q.id))
    }
  }

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return

    openConfirm({
      title: 'حذف المحدد',
      message: `هل أنت متأكد من حذف ${selectedIds.length} سؤال؟`,
      confirmLabel: 'حذف',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await questionsApi.deleteBatch(selectedIds)
          setSelectedIds([])
          loadData()
          toast.success('تم حذف الأسئلة المحددة بنجاح')
        } catch (error) {
          console.error('Error deleting batch:', error)
          toast.error('فشل حذف الأسئلة المحددة')
        }
      }
    })
  }

  const handleDeleteAll = () => {
    openConfirm({
      title: 'حذف الكل',
      message: 'هل أنت متأكد من حذف جميع الأسئلة؟ لا يمكن التراجع عن هذا الإجراء.',
      confirmLabel: 'حذف الكل',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await questionsApi.deleteAll()
          setSelectedIds([])
          loadData()
          toast.success('تم حذف جميع الأسئلة بنجاح')
        } catch (error) {
          console.error('Error deleting all:', error)
          toast.error('فشل حذف جميع الأسئلة')
        }
      }
    })
  }

  const openModal = (question?: Question) => {
    if (question) {
      setEditingQuestion(question)
      setFormData({
        questionText: question.questionText,
        correctAnswer: question.correctAnswer,
        option2: question.option2,
        option3: question.option3,
        option4: question.option4,
        levelId: question.level?.id || '',
        categoryId: question.categories?.[0]?.id || '',
        questionNumber: question.questionNumber
      })
    } else {
      setEditingQuestion(null)
      const maxNum = Math.max(0, ...questions.map(q => q.questionNumber))
      setFormData({
        questionText: '',
        correctAnswer: '',
        option2: '',
        option3: '',
        option4: '',
        levelId: '',
        categoryId: '',
        questionNumber: maxNum + 1
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingQuestion(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.questionText || !formData.correctAnswer || !formData.option2) {
      toast.error('يرجى تعبئة الحقول الإجبارية')
      return
    }

    try {
      const data = {
        ...formData,
        levelId: Number(formData.levelId) || null,
        categoryIds: formData.categoryId ? [Number(formData.categoryId)] : []
      }

      if (editingQuestion) {
        await questionsApi.update(editingQuestion.id, data)
        toast.success('تم تحديث السؤال بنجاح')
      } else {
        await questionsApi.create(data)
        toast.success('تم إضافة السؤال بنجاح')
      }
      
      closeModal()
      loadData()
    } catch (error: any) {
      console.error('Error saving question:', error)
      toast.error(error.response?.data?.error || 'فشل حفظ السؤال')
    }
  }

  const filteredQuestions = questions.filter(q =>
    q.questionText.includes(searchQuery) ||
    q.correctAnswer.includes(searchQuery)
  )

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-theme-main">الأسئلة</h1>
          <p className="text-theme-muted text-sm sm:text-base">إدارة أسئلة الاختبارات</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          {selectedIds.length > 0 && (
            <button 
              onClick={handleDeleteSelected}
              className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <FiTrash2 />
              <span>حذف المحدد ({selectedIds.length})</span>
            </button>
          )}
          
          <button 
            onClick={handleDeleteAll}
            className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <FiTrash2 />
            <span className="hidden xs:inline">حذف الكل</span>
          </button>

          <input
            type="file"
            id="excel-upload"
            className="hidden"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => document.getElementById('excel-upload')?.click()}
            disabled={loading}
            className="btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-none text-sm sm:text-base px-3 sm:px-6"
          >
            <FiUpload />
            <span className="hidden xs:inline">{loading ? 'جارٍ الرفع...' : 'رفع Excel'}</span>
          </button>
          <button 
            onClick={() => openModal()}
            className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-none text-sm sm:text-base px-3 sm:px-6"
          >
            <FiPlus />
            <span className="hidden xs:inline">إضافة سؤال</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
        <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
          <FiSearch className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-theme-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث في الأسئلة..."
            className="input-field pr-10 sm:pr-12 text-sm sm:text-base"
          />
        </div>
        <div className="flex gap-3 sm:gap-4 flex-1">
          <Select
            options={[{ id: '', name: 'جميع المستويات' }, ...levels]}
            value={filterLevel}
            onChange={(val: string | number) => setFilterLevel(val === '' ? '' : Number(val))}
            placeholder="المستوى"
            className="flex-1 sm:flex-none sm:w-48 text-sm sm:text-base"
          />
          <Select
            options={[{ id: '', name: 'جميع التصنيفات' }, ...categories]}
            value={filterCategory}
            onChange={(val: string | number) => setFilterCategory(val === '' ? '' : Number(val))}
            placeholder="التصنيف"
            className="flex-1 sm:flex-none sm:w-48 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Questions table */}
      <div ref={containerRef} className="card flex-1 overflow-hidden flex flex-col min-h-0 relative p-0">
        {loading ? (
          <div className="p-8 text-center text-theme-muted">جارٍ التحميل...</div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-8 text-center text-theme-muted">لا توجد أسئلة</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700/30' : 'bg-gray-100'}>
                <tr>
                  <th className="px-4 py-3 text-right">
                    <input 
                      type="checkbox"
                      checked={selectedIds.length === questions.length && questions.length > 0}
                      onChange={toggleSelectAll}
                      className={`rounded text-purple-500 focus:ring-purple-500 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                  </th>
                  <th className="px-4 py-3 text-right text-theme-muted font-medium">#</th>
                  <th className="px-4 py-3 text-right text-theme-muted font-medium">السؤال</th>
                  <th className="px-4 py-3 text-right text-theme-muted font-medium">المستوى</th>
                  <th className="px-4 py-3 text-right text-theme-muted font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700/50' : 'divide-gray-200'}`}>
                {filteredQuestions.map(question => (
                  <tr key={question.id} className={`transition-colors ${isDark ? 'hover:bg-gray-700/20' : 'hover:bg-gray-50'} ${selectedIds.includes(question.id) ? 'bg-purple-500/5' : ''}`}>
                    <td className="px-4 py-4">
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(question.id)}
                        onChange={() => toggleSelect(question.id)}
                        className={`rounded text-purple-500 focus:ring-purple-500 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      />
                    </td>
                    <td className="px-4 py-4 text-theme-muted">{question.questionNumber}</td>
                    <td className="px-4 py-4 text-theme-main max-w-md truncate">
                      {question.questionText}
                    </td>
                    <td className="px-4 py-4">
                      {question.level && (
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: question.level.color + '20', color: question.level.color }}
                        >
                          {question.level.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openModal(question)}
                          className={`p-2 rounded-lg transition-colors text-theme-muted hover:text-purple-500 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <FiEdit2 />
                        </button>
                        <button 
                          onClick={() => confirmDelete(question.id)}
                          className={`p-2 rounded-lg transition-colors text-theme-muted hover:text-red-500 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6 mb-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            السابق
          </button>
          
          <span className="text-theme-body">
            صفحة {page} من {totalPages}
          </span>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            التالي
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-theme-main mb-6">
              {editingQuestion ? 'تعديل السؤال' : 'سؤال جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  options={levels}
                  value={formData.levelId}
                  onChange={(val: string | number) => setFormData({ ...formData, levelId: Number(val) })}
                  placeholder="المستوى"
                  label="مستوى السؤال"
                />
                <Select
                  options={categories}
                  value={formData.categoryId}
                  onChange={(val: string | number) => setFormData({ ...formData, categoryId: Number(val) })}
                  placeholder="التصنيف"
                  label="تصنيف السؤال"
                />
              </div>

              <div>
                <label className="block text-theme-muted text-sm mb-2">رقم السؤال</label>
                <input
                  type="number"
                  value={formData.questionNumber}
                  onChange={(e) => setFormData({ ...formData, questionNumber: Number(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-theme-muted text-sm mb-2">نص السؤال</label>
                <textarea
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  className="input-field resize-none h-24"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-green-500 text-sm mb-2">الإجابة الصحيحة</label>
                  <input
                    type="text"
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    className="input-field border-green-500/50 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-theme-muted text-sm mb-2">الخيار الثاني</label>
                  <input
                    type="text"
                    value={formData.option2}
                    onChange={(e) => setFormData({ ...formData, option2: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-theme-muted text-sm mb-2">الخيار الثالث</label>
                  <input
                    type="text"
                    value={formData.option3}
                    onChange={(e) => setFormData({ ...formData, option3: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-theme-muted text-sm mb-2">الخيار الرابع</label>
                  <input
                    type="text"
                    value={formData.option4}
                    onChange={(e) => setFormData({ ...formData, option4: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className={`flex gap-3 pt-6 border-t mt-6 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="submit" className="btn-primary flex-1">
                  {editingQuestion ? 'حفظ التغييرات' : 'إضافة السؤال'}
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
