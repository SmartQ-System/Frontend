import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const { refreshToken, setTokens, logout } = useAuthStore.getState()
      
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken,
          })
          
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data
          setTokens(newAccessToken, newRefreshToken)
          
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return api(originalRequest)
        } catch {
          logout()
        }
      } else {
        logout()
      }
    }
    
    return Promise.reject(error)
  }
)

export default api

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (email: string, password: string, role?: string) =>
    api.post('/auth/register', { email, password, role }),
  
  quickLogin: (role: 'admin' | 'student') =>
    api.post('/auth/quick-login', { role }),
  
  logout: () => api.post('/auth/logout'),
  
  getMe: () => api.get('/auth/me'),

  updateProfile: (data: { name?: string; avatar?: string }) => 
    api.put('/auth/profile', data),

  updatePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.put('/auth/password', data),
}

// Questions API
export const questionsApi = {
  getAll: (params?: { page?: number; limit?: number; levelId?: number; categoryId?: number; excludeAnswered?: boolean }) =>
    api.get('/questions', { params }),
  
  getById: (id: number) => api.get(`/questions/${id}`),
  
  create: (data: any) => api.post('/questions', data),
  
  update: (id: number, data: any) => api.put(`/questions/${id}`, data),
  
  delete: (id: number) => api.delete(`/questions/${id}`),
  
  bulkUpload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/questions/bulk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  deleteBatch: (questionIds: number[]) => api.post('/questions/batch-delete', { questionIds }),
  
  deleteAll: () => api.delete('/questions'),
}

// Users API
export const usersApi = {
  getAll: () => api.get('/users'),
  updateRole: (id: number, role: string) => api.put(`/users/${id}/role`, { role }),
  ban: (id: number, banned: boolean) => api.put(`/users/${id}/ban`, { banned }),
  timeout: (id: number, duration: number) => api.put(`/users/${id}/timeout`, { duration }),
}

export const playlistsApi = {
  getAll: () => api.get('/playlists'),
  getOne: (id: number) => api.get(`/playlists/${id}`),
  create: (data: any) => api.post('/playlists', data),
  update: (id: number, data: any) => api.put(`/playlists/${id}`, data),
  delete: (id: number) => api.delete(`/playlists/${id}`),
  addQuestion: (id: number, questionId: number) => api.post(`/playlists/${id}/questions`, { questionId }),
  removeQuestion: (id: number, questionId: number) => api.delete(`/playlists/${id}/questions/${questionId}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getById: (id: number) => api.get(`/categories/${id}`),
  create: (data: { name: string; description?: string }) => api.post('/categories', data),
  update: (id: number, data: { name?: string; description?: string }) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
}

// Levels API
export const levelsApi = {
  getAll: () => api.get('/levels'),
}

// Settings API
// ... questionsApi

export const progressApi = {
  save: (questionId: number, isCorrect: boolean) => 
    api.post('/progress/save', { questionId, isCorrect }),
    
  getStats: () => api.get('/progress/stats'),
  
  getLeaderboard: () => api.get('/progress/leaderboard'),
};

export const settingsApi = {
// ...
  get: () => api.get('/settings'),
  update: (data: { voiceId?: string; questionColor?: string; backgroundColor?: string }) =>
    api.put('/settings', data),
  getOptions: () => api.get('/settings/options'),
}

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
}

export const ttsApi = {
  speak: (text: string, voice: 'official' | 'spark' = 'official') => 
    api.post('/tts/speak', { text, voice }, { responseType: 'blob' }),
}

// Edge TTS API (multi-voice support)
export const edgeTtsApi = {
  speak: (text: string, voice: string) => 
    api.post('/edge-tts/speak', { text, voice }, { responseType: 'blob' }),
  getVoices: () => api.get('/edge-tts/voices'),
}
