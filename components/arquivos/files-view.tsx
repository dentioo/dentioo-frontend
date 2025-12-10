"use client"

import { useState, useEffect } from "react"
import { Search, Upload, Grid, ListIcon, Folder, File, Download, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

type ViewMode = "grid" | "list"

interface FileItem {
  id: string
  file_name: string
  file_type: string
  file_size: number
  file_path: string
  created_at: string
  updated_at: string
}

export function FilesView() {
  const router = useRouter()
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          router.replace("/login")
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
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
        setFiles(result.data || [])
        setLoading(false)
      } catch (err) {
        console.error("Erro ao carregar arquivos:", err)
        setError("Erro ao carregar dados")
        setLoading(false)
      }
    }

    fetchFiles()
  }, [router])

  const filteredFiles = files.filter((file) =>
    file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) {
      return (
        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
          <span className="text-xs font-bold text-red-600">PDF</span>
        </div>
      )
    }
    if (type.includes("image")) {
      return (
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-xs font-bold text-blue-600">IMG</span>
        </div>
      )
    }
    return (
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
        <File className="text-gray-600" size={24} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="border-2 border-dashed border-color-neutral-light rounded-xl p-12 text-center hover:bg-color-bg-light transition cursor-pointer">
        <Upload className="mx-auto mb-3 text-color-primary-light" size={32} />
        <p className="font-semibold text-color-primary mb-1">Clique para enviar</p>
        <p className="text-sm text-gray-600">ou arraste um arquivo (máx. 50MB)</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando arquivos...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Controls */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-color-neutral-light space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar arquivos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light"
                />
              </div>

              <div className="flex border border-color-neutral-light rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition text-color-primary ${viewMode === "grid" ? "bg-blue-100" : ""}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition border-l border-color-neutral-light text-color-primary ${viewMode === "list" ? "bg-blue-100" : ""}`}
                >
                  <ListIcon size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Files */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-xl shadow-sm border border-color-neutral-light p-4 hover:shadow-md transition group"
                >
                  <div className="flex justify-center mb-3">{getFileIcon(file.file_type)}</div>
                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{file.file_name}</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {new Date(file.created_at).toLocaleDateString("pt-BR")} • {(file.file_size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button className="flex-1 px-2 py-1 bg-color-primary-light bg-opacity-10 text-color-primary rounded text-xs font-medium hover:bg-opacity-20 transition flex items-center justify-center gap-1">
                      <Download size={14} />
                    </button>
                    <button className="flex-1 px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-medium hover:bg-red-200 transition flex items-center justify-center gap-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-color-neutral-light overflow-hidden">
              <table className="w-full">
                <thead className="bg-color-bg-light border-b border-color-neutral-light">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-color-primary">Nome</th>
                    <th className="text-left py-3 px-4 font-semibold text-color-primary">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold text-color-primary">Tamanho</th>
                    <th className="text-left py-3 px-4 font-semibold text-color-primary">Data</th>
                    <th className="text-left py-3 px-4 font-semibold text-color-primary">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="border-b border-color-neutral-light hover:bg-color-bg-light transition">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{file.file_name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{file.file_type}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{(file.file_size / 1024 / 1024).toFixed(2)} MB</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(file.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 px-4 text-sm flex gap-2">
                        <button className="p-1 hover:bg-gray-200 rounded transition text-color-primary-light">
                          <Download size={16} />
                        </button>
                        <button className="p-1 hover:bg-red-100 rounded transition text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <File className="mx-auto mb-3 text-gray-400" size={48} />
              <p className="text-gray-500 font-medium">Nenhum arquivo encontrado</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
