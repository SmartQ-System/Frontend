import { useState, useEffect } from 'react'
import { categoriesApi } from '../../lib/api'
import { useTableHeight } from '../../hooks/useTableHeight'
import { useUiStore } from '../../stores/uiStore'
import { useThemeStore } from '../../stores/themeStore'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'

interface Category {
  id: number
  name: string
  description?: string
  questionCount: number
}

export default function CategoriesPage() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  // Dynamic pagination
  // Estimate card height ~180px, multiplying by 3 for max grid columns
  const { containerRef, limit: rowLimit } = useTableHeight(180, 80)
  const limit = rowLimit * 3
  const [page, setPage] = useState(1)

  // Pagination Logic
  const totalPages = Math.ceil(categories.length / limit)
  const paginatedCategories = categories.slice((page - 1) * limit, page * limit)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await categoriesApi.getAll()
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, formData)
      } else {
        await categoriesApi.create(formData)
      }
      loadCategories()
      closeModal()
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const { openConfirm } = useUiStore()

  const handleDelete = async (id: number) => {
    openConfirm({
      title: 'حذف التصنيف',
      message: 'هل أنت متأكد من حذف هذا التصنيف؟ سيتم حذف جميع الأسئلة المرتبطة به.',
      confirmLabel: 'حذف',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await categoriesApi.delete(id)
          setCategories(categories.filter(c => c.id !== id))
        } catch (error) {
          console.error('Error deleting category:', error)
        }
      },
    })
  }

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({ name: category.name, description: category.description || '' })
    } else {
      setEditingCategory(null)
      setFormData({ name: '', description: '' })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-theme-main">التصنيفات</h1>
          <p className="text-theme-muted">إدارة تصنيفات الأسئلة</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <FiPlus />
          <span>إضافة تصنيف</span>
        </button>
      </div>

      {/* Categories grid container */}
      <div ref={containerRef} className="flex-1 overflow-y-auto min-h-0 pb-4 relative">
        {/* Categories grid */}
        {loading ? (
          <div className="text-center text-theme-muted py-12">جارٍ التحميل...</div>
        ) : categories.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-theme-muted mb-4">لا توجد تصنيفات</p>
            <button onClick={() => openModal()} className="btn-primary">
              إضافة تصنيف جديد
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCategories.map(category => (
              <div key={category.id} className="card p-6 hover:border-purple-500/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-theme-main">{category.name}</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openModal(category)}
                      className={`p-2 rounded-lg transition-colors text-theme-muted hover:text-purple-500 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id)}
                      className={`p-2 rounded-lg transition-colors text-theme-muted hover:text-red-500 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                {category.description && (
                  <p className="text-theme-muted text-sm mb-4">{category.description}</p>
                )}
                <div className="text-sm text-theme-muted">
                  {category.questionCount} سؤال
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4 shrink-0">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            السابق
          </button>
          
          <span className="text-theme-muted">
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
          <div className="card p-6 w-full max-w-md animate-slide-up">
            <h2 className="text-xl font-bold text-theme-main mb-6">
              {editingCategory ? 'تعديل التصنيف' : 'تصنيف جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-theme-muted text-sm mb-2">اسم التصنيف</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-theme-muted text-sm mb-2">الوصف (اختياري)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field resize-none h-24"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingCategory ? 'حفظ التغييرات' : 'إضافة'}
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
