import { useState, useEffect } from 'react'
import { usersApi } from '../../lib/api'
import { useTableHeight } from '../../hooks/useTableHeight'
import { useThemeStore } from '../../stores/themeStore'
import { FiSearch, FiUser, FiZap, FiShield } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { useUiStore } from '../../stores/uiStore'
import { useAuthStore } from '../../stores/authStore'

interface User {
  id: number
  name: string | null
  email: string
  role: string
  createdAt: string
  avatar: string | null
  isBanned: boolean
  timeoutUntil: string | null
}

export default function UsersPage() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { openConfirm } = useUiStore()
  
  // Pagination state
  const { containerRef, limit } = useTableHeight(80, 60)
  const [page, setPage] = useState(1)
  const { user: currentUser } = useAuthStore()

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await usersApi.getAll()
      setUsers(res.data.users)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('فشل تحميل المستخدمين')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRoleChange = (user: User, newRole: string) => {
    const getRoleName = (r: string) => {
      switch(r) {
        case 'admin': return 'مدير';
        case 'mentor': return 'مشرف';
        case 'student': return 'طالب';
        default: return r;
      }
    }
    const message = `هل أنت متأكد من تغيير صلاحية المستخدم ${user.name || user.email} إلى ${getRoleName(newRole)}؟`
    
    openConfirm({
      title: 'تغيير الصلاحيات',
      message: message,
      confirmLabel: 'تأكيد',
      variant: 'warning',
      onConfirm: async () => {
        try {
          await usersApi.updateRole(user.id, newRole)
          toast.success('تم تحديث الصلاحيات بنجاح')
          loadData()
        } catch (error) {
          console.error('Error updating role:', error)
          toast.error('فشل تحديث الصلاحيات')
        }
      }
    })
  }

  const handleBan = (user: User) => {
      const action = user.isBanned ? 'إلغاء حظر' : 'حظر';
      openConfirm({
          title: `${action} المستخدم`,
          message: `هل أنت متأكد من ${action} المستخدم ${user.name || user.email}؟`,
          confirmLabel: 'تأكيد',
          variant: 'danger',
          onConfirm: async () => {
              try {
                  await usersApi.ban(user.id, !user.isBanned);
                  toast.success(`تم ${action} بنجاح`);
                  loadData();
              } catch (error) {
                  toast.error('فشل تنفيذ الإجراء');
              }
          }
      });
  };

  const handleTimeout = (user: User) => {
      const isTimedOut = user.timeoutUntil && new Date(user.timeoutUntil) > new Date();
      if (isTimedOut) {
          openConfirm({
              title: 'إلغاء التعليق',
              message: `هل تريد إلغاء التعليق المؤقت عن ${user.name}?`,
              confirmLabel: 'إلغاء التعليق',
              onConfirm: async () => {
                  await usersApi.timeout(user.id, 0);
                  toast.success('تم إلغاء التعليق');
                  loadData();
              }
          });
      } else {
          const durationStr = prompt('أدخل مدة التعليق بالدقائق (مثلاً 60):', '60');
          if (!durationStr) return;
          const duration = parseInt(durationStr);
          if (isNaN(duration) || duration <= 0) {
              toast.error('مدة غير صالحة');
              return;
          }
          
          openConfirm({
            title: 'تأكيد التعليق',
            message: `تعليق حساب ${user.name} لمدة ${duration} دقيقة؟`,
            confirmLabel: 'تعليق',
            variant: 'warning',
            onConfirm: async () => {
                await usersApi.timeout(user.id, duration);
                toast.success('تم تعليق الحساب');
                loadData();
            }
          });
      }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(search.toLowerCase()))
  )

  const totalPages = Math.ceil(filteredUsers.length / limit)
  const paginatedUsers = filteredUsers.slice((page - 1) * limit, page * limit)

  // Reset page when filter changes
  useEffect(() => {
    setPage(1)
  }, [search])

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin':
        return <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded-md text-xs font-bold border border-red-500/20 flex items-center gap-1 w-fit"><FiShield /> مدير</span>
      case 'mentor':
        return <span className="bg-purple-500/10 text-purple-500 px-2 py-1 rounded-md text-xs font-bold border border-purple-500/20 flex items-center gap-1 w-fit"><FiZap /> مشرف</span>
      default:
        return <span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded-md text-xs font-bold border border-blue-500/20 flex items-center gap-1 w-fit"><FiUser /> طالب</span>
    }
  }

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-main mb-2">إدارة المستخدمين</h1>
          <p className="text-theme-muted">عرض وتعديل صلاحيات المستخدمين</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted" />
          <input 
            type="text"
            placeholder="بحث عن مستخدم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pr-10"
          />
        </div>
      </div>

      {/* Table */}
      <div ref={containerRef} className="card overflow-hidden flex-1 flex flex-col min-h-0 relative">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-700/30' : 'bg-gray-100'}>
              <tr>
                <th className="px-4 py-3 text-right text-theme-muted font-medium">المستخدم</th>
                <th className="px-4 py-3 text-right text-theme-muted font-medium">البريد الإلكتروني</th>
                <th className="px-4 py-3 text-right text-theme-muted font-medium">الدور</th>
                <th className="px-4 py-3 text-right text-theme-muted font-medium">تاريخ التسجيل</th>
                <th className="px-4 py-3 text-right text-theme-muted font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700/50' : 'divide-gray-200'}`}>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-theme-muted">جاري التحميل...</td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-theme-muted">لا يوجد مستخدمين</td>
                </tr>
              ) : (
                paginatedUsers.map(user => (
                  <tr key={user.id} className={`transition-colors ${isDark ? 'hover:bg-gray-700/20' : 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                          {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" /> : <FiUser />}
                        </div>
                        <span className="text-theme-main font-medium">{user.name || 'مستخدم بدون اسم'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-theme-muted" dir="ltr">{user.email}</td>
                    <td className="px-4 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-4 py-4 text-theme-muted text-sm">
                      {new Date(user.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-4">
                      {user.id !== currentUser?.id && (
                        <div className="flex items-center gap-2">
                          {/* Role Select */}
                          {currentUser?.role === 'admin' && (
                             <select
                               value={user.role}
                               onChange={(e) => handleRoleChange(user, e.target.value)}
                               className={`text-xs rounded-lg border p-1 cursor-pointer ${
                                 isDark 
                                   ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600'
                                   : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                               } focus:ring-purple-500 focus:border-purple-500`}
                             >
                                <option value="student">طالب</option>
                                <option value="mentor">مشرف</option>
                                <option value="admin">مدير</option>
                             </select>
                          )}

                          {/* Ban Button */}
                          {(currentUser?.role === 'admin' || (currentUser?.role === 'mentor' && user.role === 'student')) && (
                            <button
                               onClick={() => handleBan(user)}
                               title={user.isBanned ? "إلغاء الحظر" : "حظر المستخدم"}
                               className={`p-1.5 rounded-lg transition-colors ${
                                  user.isBanned 
                                    ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
                                    : isDark 
                                      ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                               }`}
                            >
                               {user.isBanned ? <FiShield className="text-red-500" /> : <FiShield />} 
                            </button>
                          )}

                          {/* Timeout Button */}
                          {(currentUser?.role === 'admin' || (currentUser?.role === 'mentor' && user.role === 'student')) && (
                             <div className="relative group">
                                <button
                                   onClick={() => handleTimeout(user)}
                                   title={user.timeoutUntil ? `معلق حتى ${new Date(user.timeoutUntil).toLocaleTimeString()}` : "تعليق مؤقت"}
                                   className={`p-1.5 rounded-lg transition-colors ${
                                      user.timeoutUntil && new Date(user.timeoutUntil) > new Date()
                                        ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30' 
                                        : isDark 
                                          ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                          : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                   }`}
                                >
                                   <FiZap />
                                </button>
                             </div>
                          )}
                        </div>
                      )}
                      {user.id === currentUser?.id && <span className="text-theme-muted text-xs italic">أنت</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4 shrink-0 pb-4">
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
    </div>
  )
}
