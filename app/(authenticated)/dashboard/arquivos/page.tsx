'use client'

import { useState, useEffect, useRef } from "react"
import { 
  Search, 
  Upload, 
  Grid3x3, 
  List, 
  File, 
  Download, 
  Trash2,
  FileText,
  Image as ImageIcon,
  FileType,
  Folder,
  BarChart3,
  Calendar,
  HardDrive,
  Filter,
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { useRouter } from "next/navigation"
import { ConfirmModal } from "@/components/ui/confirm-modal"

type ViewMode = 'cards' | 'list' | 'stats'
type FileTypeFilter = 'all' | 'pdf' | 'image' | 'other'

interface FileItem {
  id: string
  file_name: string
  file_type: string
  file_size: number
  file_path?: string
  file_url?: string
  storage_path?: string
  created_at: string
  updated_at: string
}

/* ============================================
   BACKUP DO CÓDIGO ANTERIOR (COMENTADO)
   ============================================
   
'use client'

import { PageHeader } from "@/components/ui/page-header"
import { FilesView } from "@/components/arquivos/files-view"

export default function ArquivosPage() {
  return (
    <>
      <PageHeader
        title="Arquivos"
        description="Gerencie seus arquivos e documentos"
      />

      <FilesView />
    </>
  )
}

   ============================================
   FIM DO BACKUP
   ============================================ */

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export default function ArquivosPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [fileTypeFilter, setFileTypeFilter] = useState<FileTypeFilter>('all')
  const [searchTerm, setSearchTerm] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [storageLimit, setStorageLimit] = useState<number>(0) // em bytes
  const [usedStorage, setUsedStorage] = useState<number>(0) // em bytes
  const [authProvider, setAuthProvider] = useState<string | null>(null)
  const [googleDriveConnected, setGoogleDriveConnected] = useState<boolean>(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  // Removido: apenas sistema (Google Drive do sistema/plano) é usado agora

  // Função para obter limite de armazenamento baseado no plano
  const getStorageLimit = (planName: string | null): number => {
    const plan = planName?.toLowerCase() || 'free'
    
    switch (plan) {
      case 'free':
      case 'free_trial':
        return 1 * 1024 * 1024 * 1024 // 1GB
      case 'starter':
        return 5 * 1024 * 1024 * 1024 // 5GB
      case 'professional':
        return 50 * 1024 * 1024 * 1024 // 50GB
      case 'premium':
        return 300 * 1024 * 1024 * 1024 // 300GB (ilimitado mas limitado em 300GB)
      default:
        return 1 * 1024 * 1024 * 1024 // 1GB padrão
    }
  }

  // Função para buscar informações do usuário
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setCheckingAuth(false)
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        const user = data.data?.user
        if (user) {
          setAuthProvider(user.auth_provider || 'email')
          setGoogleDriveConnected(user.google_drive_connected || false)
        }
      }
    } catch (err) {
      console.error('Erro ao buscar informações do usuário:', err)
    } finally {
      setCheckingAuth(false)
    }
  }

  // Buscar informações do usuário (auth_provider e google_drive_connected)
  useEffect(() => {
    fetchUserInfo()
  }, [])

  // Verificar se voltou do callback do Google OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const googleAuth = urlParams.get('google_auth')
    const error = urlParams.get('error')

    if (googleAuth === 'success') {
      // Atualizar informações do usuário após conexão bem-sucedida
      fetchUserInfo()
      // Limpar parâmetro da URL
      window.history.replaceState({}, '', window.location.pathname)
    } else if (error === 'auth_failed') {
      alert('Erro ao conectar com Google. Tente novamente.')
      // Limpar parâmetro da URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // Buscar plano atual do usuário
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const response = await fetch(`${apiUrl}/api/trial/status`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          const planName = data.data?.plan_name || data.data?.subscription?.plan_name || 'free'
          setCurrentPlan(planName)
          setStorageLimit(getStorageLimit(planName))
        }
      } catch (err) {
        // Erro silencioso - usar limite padrão
        setStorageLimit(getStorageLimit('free'))
      }
    }

    fetchPlan()
  }, [])

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          router.replace("/login")
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        
        // Buscar arquivos do sistema (Google Drive do sistema/plano)
        const response = await fetch(`${apiUrl}/api/files`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            router.replace("/login")
            return
          }
          throw new Error("Erro ao carregar arquivos")
        }

        const result = await response.json()
        
        // Se houver erro mas retornar array vazio, tratar como sucesso
        if (!result.success && result.data && Array.isArray(result.data)) {
          setFiles([])
          setError(result.message || "Erro ao carregar dados")
          setLoading(false)
          return
        }
        
        const filesData = result.data || []
        setFiles(filesData)
        setError("") // Limpar erro se sucesso
        
        // Calcular armazenamento usado
        const totalSize = filesData.reduce((sum: number, file: FileItem) => sum + file.file_size, 0)
        setUsedStorage(totalSize)
        
        setLoading(false)
      } catch (err: any) {
        const errorMessage = err.message || "Erro ao carregar dados"
        setError(errorMessage)
        setFiles([]) // Limpar lista em caso de erro
        setLoading(false)
      }
    }

    fetchFiles()
  }, [router])

  const handleFileUpload = async (file: File) => {
    // Verificar se usuário está logado com Google
    const isGoogleAuth = authProvider === 'google' || googleDriveConnected
    if (!isGoogleAuth) {
      alert("Você precisa estar logado com Google para fazer upload de arquivos. Por favor, conecte sua conta do Google.")
      return
    }

    // Verificar limite de armazenamento
    const newTotalSize = usedStorage + file.size
    
    if (newTotalSize > storageLimit) {
      const limitGB = (storageLimit / (1024 * 1024 * 1024)).toFixed(0)
      const usedGB = (usedStorage / (1024 * 1024 * 1024)).toFixed(2)
      alert(`Limite de armazenamento atingido!\n\nPlano atual: ${currentPlan || 'Free'}\nLimite: ${limitGB}GB\nUsado: ${usedGB}GB\n\nFaça upgrade do seu plano para aumentar o limite.`)
      return
    }

    // Limite de tamanho por arquivo (50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert("Arquivo muito grande. Tamanho máximo por arquivo: 50MB")
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.replace("/login")
        return
      }

      const formData = new FormData()
      formData.append('file', file)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
      // Upload para sistema (Google Drive do sistema/plano)
      const response = await fetch(`${apiUrl}/api/files`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || errorData.error || "Erro ao fazer upload"
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setFiles([result.data, ...files])
      
      // Atualizar armazenamento usado
      setUsedStorage(usedStorage + file.size)
      setUploadProgress(100)
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 1000)
    } catch (err: any) {
      alert(err.message || "Erro ao fazer upload do arquivo")
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async () => {
    if (!selectedFileId) return

    setDeleteLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.replace("/login")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/files/${selectedFileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("Erro ao deletar arquivo")
      }

      const deletedFile = files.find((f) => f.id === selectedFileId)
      if (deletedFile) {
        setUsedStorage(usedStorage - deletedFile.file_size)
      }
      setFiles(files.filter((f) => f.id !== selectedFileId))
      setShowDeleteConfirm(false)
      setSelectedFileId(null)
    } catch (err) {
      alert("Erro ao deletar arquivo")
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDownload = async (file: FileItem) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
      // Download de arquivo do sistema
      const endpoint = `${apiUrl}/api/files/${file.id}/download`
      
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Erro ao baixar arquivo")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.file_name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      alert("Erro ao baixar arquivo")
    }
  }

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) {
      return { icon: FileText, color: "from-red-500 to-red-600", bg: "bg-red-50", text: "PDF" }
    }
    if (type.includes("image")) {
      return { icon: ImageIcon, color: "from-blue-500 to-blue-600", bg: "bg-blue-50", text: "IMG" }
    }
    return { icon: FileType, color: "from-gray-500 to-gray-600", bg: "bg-gray-50", text: "FILE" }
  }

  const filteredFiles = files.filter((file) => {
    const matchSearch = file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (fileTypeFilter === 'pdf') {
      return matchSearch && file.file_type.includes('pdf')
    }
    if (fileTypeFilter === 'image') {
      return matchSearch && file.file_type.includes('image')
    }
    if (fileTypeFilter === 'other') {
      return matchSearch && !file.file_type.includes('pdf') && !file.file_type.includes('image')
    }
    
    return matchSearch
  })

  const stats = {
    total: files.length,
    pdf: files.filter(f => f.file_type.includes('pdf')).length,
    images: files.filter(f => f.file_type.includes('image')).length,
    other: files.filter(f => !f.file_type.includes('pdf') && !f.file_type.includes('image')).length,
    totalSize: usedStorage,
    recent: files.filter(f => {
      const days = Math.floor((new Date().getTime() - new Date(f.created_at).getTime()) / (1000 * 60 * 60 * 24))
      return days <= 7
    }).length,
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    // Verificar se usuário está logado com Google
    const isGoogleAuth = authProvider === 'google' || googleDriveConnected
    if (!isGoogleAuth) {
      return
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleConnectGoogle = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.replace("/login")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/files/google/auth`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("Erro ao iniciar conexão com Google")
      }

      const data = await response.json()
      if (data.success && data.authUrl) {
        window.location.href = data.authUrl
      } else {
        alert("Erro ao iniciar conexão com Google")
      }
    } catch (err: any) {
      alert(err.message || "Erro ao conectar com Google")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando arquivos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header Moderno */}
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Arquivos 📁</h1>
          <p className="text-lg text-gray-600">Gerencie seus arquivos e documentos</p>
        </div>

        {/* Seletor de Armazenamento */}
        <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Armazenamento</h3>
              <p className="text-sm text-gray-600">Escolha onde seus arquivos serão armazenados</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Armazenamento do Sistema:</strong> Usa o espaço do seu plano ({currentPlan || 'Free'}). 
              Limite: {formatFileSize(storageLimit)} | Usado: {formatFileSize(usedStorage)}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900/70">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <File className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-900/70">PDFs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pdf}</p>
              </div>
              <FileText className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900/70">Imagens</p>
                <p className="text-2xl font-bold text-gray-900">{stats.images}</p>
              </div>
              <ImageIcon className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900/70">Outros</p>
                <p className="text-2xl font-bold text-gray-900">{stats.other}</p>
              </div>
              <FileType className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-900/70">Recentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recent}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-900/70">Armazenamento</p>
                <p className="text-xl font-bold text-gray-900">{formatFileSize(usedStorage)}</p>
                <p className="text-xs text-indigo-700 mt-1">
                  de {formatFileSize(storageLimit)} ({currentPlan || 'Free'})
                </p>
                {/* Barra de progresso */}
                <div className="mt-2 w-full bg-indigo-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      (usedStorage / storageLimit) * 100 > 90
                        ? 'bg-red-500'
                        : (usedStorage / storageLimit) * 100 > 70
                        ? 'bg-yellow-500'
                        : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min((usedStorage / storageLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <HardDrive className="w-8 h-8 text-indigo-600 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {checkingAuth ? (
        <div className="mb-8 border-2 border-dashed rounded-2xl p-12 text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium mt-4">Verificando permissões...</p>
        </div>
      ) : (() => {
        const isGoogleAuth = authProvider === 'google' || googleDriveConnected
        return (
          <div
            className={`mb-8 border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              !isGoogleAuth
                ? 'border-red-300 bg-red-50 cursor-not-allowed opacity-75'
                : dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-gradient-to-br from-gray-50 to-white hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer'
            }`}
            onDragEnter={isGoogleAuth ? handleDrag : undefined}
            onDragLeave={isGoogleAuth ? handleDrag : undefined}
            onDragOver={isGoogleAuth ? handleDrag : undefined}
            onDrop={isGoogleAuth ? handleDrop : undefined}
            onClick={isGoogleAuth ? () => fileInputRef.current?.click() : undefined}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              disabled={!isGoogleAuth}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0])
                }
              }}
            />
            {uploading ? (
              <div className="space-y-4">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-gray-600 font-medium">Enviando arquivo...</p>
              </div>
            ) : !isGoogleAuth ? (
              <>
                <div className="inline-flex p-4 bg-red-100 rounded-full mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <p className="font-bold text-gray-900 text-lg mb-2">Upload bloqueado</p>
                <p className="text-sm text-gray-600 mb-4">
                  Você precisa estar logado com Google para fazer upload de arquivos.
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleConnectGoogle()
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
                  </svg>
                  Conectar com Google
                </button>
              </>
            ) : (
              <>
                <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <p className="font-bold text-gray-900 text-lg mb-2">Clique para enviar ou arraste arquivos</p>
                <p className="text-sm text-gray-600">
                  Tamanho máximo por arquivo: 50MB | Armazenamento: {formatFileSize(usedStorage)} / {formatFileSize(storageLimit)} ({currentPlan || 'Free'})
                </p>
              </>
            )}
          </div>
        )
      })()}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4 overflow-x-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'cards'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Grid3x3 size={18} />
            Cards
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'list'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <List size={18} />
            Lista
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'stats'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <BarChart3 size={18} />
            Estatísticas
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      {viewMode !== 'stats' && (
        <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar arquivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="w-full md:w-auto overflow-x-auto md:overflow-visible">
              <div className="flex gap-2 min-w-max md:min-w-0 pb-2 md:pb-0">
              <button
                onClick={() => setFileTypeFilter('all')}
                className={`px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  fileTypeFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFileTypeFilter('pdf')}
                className={`px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  fileTypeFilter === 'pdf'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                PDFs
              </button>
              <button
                onClick={() => setFileTypeFilter('image')}
                className={`px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  fileTypeFilter === 'image'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Imagens
              </button>
              <button
                onClick={() => setFileTypeFilter('other')}
                className={`px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  fileTypeFilter === 'other'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Outros
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="animate-in fade-in duration-300">
        {viewMode === 'cards' && (
          <>
            {filteredFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredFiles.map((file, index) => {
                  const fileIcon = getFileIcon(file.file_type)
                  const Icon = fileIcon.icon
                  return (
                    <div
                      key={file.id}
                      className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex justify-center mb-4">
                        <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${fileIcon.color} flex items-center justify-center shadow-md`}>
                          <Icon className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 text-center">{file.file_name}</h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                          <Calendar size={12} className="text-gray-400" />
                          <span>{new Date(file.created_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                          <HardDrive size={12} className="text-gray-400" />
                          <span>{formatFileSize(file.file_size)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownload(file)
                          }}
                          className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download size={16} />
                          Baixar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedFileId(file.id)
                            setShowDeleteConfirm(true)
                          }}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                  <File className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-700 font-semibold text-lg mb-2">Nenhum arquivo encontrado</p>
                <p className="text-gray-500 mb-6">
                  {searchTerm || fileTypeFilter !== 'all' ? 'Tente ajustar sua busca ou filtros' : 'Comece fazendo upload do seu primeiro arquivo'}
                </p>
                {!searchTerm && fileTypeFilter === 'all' && (() => {
                  const isGoogleAuth = authProvider === 'google' || googleDriveConnected
                  return isGoogleAuth ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                    >
                      <Upload size={20} />
                      Fazer Upload
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleConnectGoogle()
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
                      </svg>
                      Conectar com Google
                    </button>
                  )
                })()}
              </div>
            )}
          </>
        )}

        {viewMode === 'list' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Nome</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Tipo</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Tamanho</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Data</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => {
                    const fileIcon = getFileIcon(file.file_type)
                    const Icon = fileIcon.icon
                    return (
                      <tr
                        key={file.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${fileIcon.bg}`}>
                              <Icon size={18} className={fileIcon.color.includes('red') ? 'text-red-600' : fileIcon.color.includes('blue') ? 'text-blue-600' : 'text-gray-600'} />
                            </div>
                            <span className="font-semibold text-gray-900">{file.file_name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{file.file_type}</td>
                        <td className="py-4 px-6 text-gray-600">{formatFileSize(file.file_size)}</td>
                        <td className="py-4 px-6 text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            {new Date(file.created_at).toLocaleDateString("pt-BR")}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDownload(file)}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                              title="Baixar"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedFileId(file.id)
                                setShowDeleteConfirm(true)
                              }}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                              title="Deletar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredFiles.length === 0 && (
              <div className="py-12 text-center">
                <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Nenhum arquivo encontrado</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Distribuição por Tipo</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">PDFs</span>
                      <span className="text-sm font-bold text-gray-900">{stats.pdf}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.pdf / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Imagens</span>
                      <span className="text-sm font-bold text-gray-900">{stats.images}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.images / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Outros</span>
                      <span className="text-sm font-bold text-gray-900">{stats.other}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.other / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Resumo</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Total de Arquivos</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-gray-900">Recentes (7 dias)</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stats.recent}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-3">
                      <HardDrive className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium text-gray-900">Armazenamento Total</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Counter */}
      {viewMode !== 'stats' && filteredFiles.length > 0 && (
        <div className="mt-6 text-sm text-gray-600 text-center">
          Mostrando <span className="font-semibold text-gray-900">{filteredFiles.length}</span> de{' '}
          <span className="font-semibold text-gray-900">{files.length}</span> arquivos
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Deletar Arquivo"
        message="Tem certeza que deseja deletar este arquivo? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteConfirm(false)
          setSelectedFileId(null)
        }}
        isLoading={deleteLoading}
        isDangerous={true}
      />
    </div>
  )
}
