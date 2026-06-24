import { useState, useEffect } from 'react'
import { playlistsApi } from '../../lib/api'
import { useThemeStore } from '../../stores/themeStore'
import { FiPlus, FiTrash2, FiEdit2, FiList, FiBook } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { useUiStore } from '../../stores/uiStore'
import { Link } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

interface Playlist {
  id: number
  title: string
  description?: string
  questionCount: number
  createdAt: string
}

const playlistSchema = Yup.object().shape({
  title: Yup.string().required('عنوان القائمة مطلوب'),
  description: Yup.string().nullable(),
});

export default function PlaylistsPage() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null)
  
  const { openConfirm } = useUiStore()

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await playlistsApi.getAll()
      setPlaylists(res.data.playlists)
    } catch (error) {
      console.error('Error loading playlists:', error)
      toast.error('فشل تحميل قوائم التشغيل')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenModal = (playlist?: Playlist) => {
    if (playlist) {
      setEditingPlaylist(playlist)
    } else {
      setEditingPlaylist(null)
    }
    setIsModalOpen(true)
  }

  const handleDelete = (playlist: Playlist) => {
    openConfirm({
      title: 'حذف قائمة التشغيل',
      message: `هل أنت متأكد من حذف القائمة "${playlist.title}"؟`,
      confirmLabel: 'حذف',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await playlistsApi.delete(playlist.id)
          toast.success('تم الحذف بنجاح')
          loadData()
        } catch (error) {
          console.error('Error deleting playlist:', error)
          toast.error('فشل الحذف')
        }
      }
    })
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-main mb-2">قوائم التشغيل</h1>
          <p className="text-theme-muted">إدارة مجموعات الأسئلة</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus />
          <span>قائمة جديدة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             [...Array(3)].map((_, i) => (
               <div key={i} className={`rounded-xl p-6 border h-48 animate-pulse ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-100 border-gray-200'}`}></div>
             ))
        ) : playlists.length === 0 ? (
          <div className={`col-span-full text-center py-12 text-theme-muted rounded-xl border border-dashed ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-50 border-gray-300'}`}>
            <FiList className="mx-auto text-4xl mb-4 opacity-50" />
            <p>لا توجد قوائم تشغيل حالياً</p>
          </div>
        ) : (
          playlists.map(playlist => (
            <div key={playlist.id} className="card p-6 flex flex-col hover:border-purple-500/30 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <FiBook className="text-xl" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(playlist)}
                    className={`p-2 rounded-lg transition-colors text-theme-muted hover:text-theme-main ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <FiEdit2 />
                  </button>
                  <button 
                    onClick={() => handleDelete(playlist)}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-theme-muted hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-theme-main mb-2">{playlist.title}</h3>
              <p className="text-theme-muted text-sm mb-4 line-clamp-2 min-h-[40px]">
                {playlist.description || 'لا يوجد وصف'}
              </p>
              
              <div className={`mt-auto pt-4 border-t flex justify-between items-center ${isDark ? 'border-gray-700/50' : 'border-gray-200'}`}>
                <span className="text-sm text-theme-muted">
                  {playlist.questionCount} سؤال
                </span>
                <Link 
                  to={`/admin/playlists/${playlist.id}`}
                  className="text-purple-500 hover:text-purple-400 text-sm font-medium flex items-center gap-1"
                >
                  عرض التفاصيل <FiList />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card w-full max-w-md animate-fade-in-up">
            <h2 className="text-xl font-bold text-theme-main mb-6">
              {editingPlaylist ? 'تعديل القائمة' : 'قائمة جديدة'}
            </h2>
            
            <Formik
              initialValues={{
                title: editingPlaylist?.title || '',
                description: editingPlaylist?.description || ''
              }}
              validationSchema={playlistSchema}
              enableReinitialize
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  if (editingPlaylist) {
                    await playlistsApi.update(editingPlaylist.id, values)
                    toast.success('تم تحديث القائمة بنجاح')
                  } else {
                    await playlistsApi.create(values)
                    toast.success('تم إنشاء القائمة بنجاح')
                  }
                  setIsModalOpen(false)
                  loadData()
                } catch (error) {
                  console.error('Error saving playlist:', error)
                  toast.error('حدث خطأ أثناء الحفظ')
                } finally {
                  setSubmitting(false)
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-theme-muted text-sm mb-2">عنوان القائمة</label>
                    <Field 
                      name="title"
                      type="text"
                      className="input-field"
                      placeholder="مثال: أسئلة الوحدة الأولى"
                    />
                    <ErrorMessage name="title" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div>
                    <label className="block text-theme-muted text-sm mb-2">الوصف</label>
                    <Field 
                      name="description"
                      as="textarea"
                      className="input-field h-24 resize-none"
                      placeholder="وصف مختصر لمحتوى القائمة..."
                    />
                    <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      disabled={isSubmitting}
                      className="btn-secondary flex-1"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary flex-1"
                    >
                      حفظ
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  )
}
