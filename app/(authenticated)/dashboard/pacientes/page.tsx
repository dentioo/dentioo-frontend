'use client'

import { useState, useEffect } from "react"
import { 
  Search, 
  Phone, 
  Mail, 
  Edit, 
  Trash2, 
  Plus, 
  Users, 
  Calendar,
  Filter,
  Grid3x3,
  List,
  BarChart3,
  UserPlus,
  TrendingUp,
  Clock,
  X
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ConfirmModal } from "@/components/ui/confirm-modal"

type ViewMode = 'list' | 'cards' | 'stats'
type FilterStatus = 'all' | 'recent' | 'old'

interface Patient {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  cpf: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

/* ============================================
   BACKUP DO CÓDIGO ANTERIOR (COMENTADO)
   ============================================
   
'use client'

import { PageHeader } from "@/components/ui/page-header"
import { PatientsList } from "@/components/pacientes/patients-list"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function PacientesPage() {
  return (
    <>
      <PageHeader
        title="Pacientes"
        description="Visualize e gerencie todos os seus pacientes"
        action={
          <Link href="/dashboard/pacientes/novo" className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Novo Paciente
          </Link>
        }
      />

      <PatientsList />
    </>
  )
}

   ============================================
   FIM DO BACKUP
   ============================================ */

export default function PacientesPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          router.replace("/login")
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const response = await fetch(`${apiUrl}/api/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            router.replace("/login")
            return
          }
          throw new Error("Erro ao carregar pacientes")
        }

        const result = await response.json()
        setPatients(result.data || [])
        setLoading(false)
      } catch (err) {
        console.error("Erro ao carregar pacientes:", err)
        setError("Erro ao carregar dados")
        setLoading(false)
      }
    }

    fetchPatients()
  }, [router])

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return

    setDeleting(patientToDelete.id)
    try {
      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/patients/${patientToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.replace("/login")
          return
        }
        throw new Error("Erro ao deletar paciente")
      }

      setPatients(patients.filter((p) => p.id !== patientToDelete.id))
      setShowDeleteModal(false)
      setPatientToDelete(null)
    } catch (err) {
      console.error("Erro ao deletar paciente:", err)
      alert("Erro ao deletar paciente")
    } finally {
      setDeleting(null)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setPatientToDelete(null)
    setDeleting(null)
  }

  const filteredPatients = patients.filter((patient) => {
    const matchSearch =
      patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.phone && patient.phone.includes(searchTerm)) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (filterStatus === 'recent') {
      const daysSinceCreation = Math.floor(
        (new Date().getTime() - new Date(patient.created_at).getTime()) / (1000 * 60 * 60 * 24)
      )
      return matchSearch && daysSinceCreation <= 30
    }
    
    if (filterStatus === 'old') {
      const daysSinceCreation = Math.floor(
        (new Date().getTime() - new Date(patient.created_at).getTime()) / (1000 * 60 * 60 * 24)
      )
      return matchSearch && daysSinceCreation > 30
    }
    
    return matchSearch
  })

  const stats = {
    total: patients.length,
    recent: patients.filter(p => {
      const days = Math.floor((new Date().getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24))
      return days <= 30
    }).length,
    withEmail: patients.filter(p => p.email).length,
    withPhone: patients.filter(p => p.phone).length,
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRandomColor = (name: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-orange-500 to-orange-600',
      'from-indigo-500 to-indigo-600',
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pacientes...</p>
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Pacientes 👥</h1>
            <p className="text-lg text-gray-600">Gerencie todos os seus pacientes</p>
          </div>
          <Link
            href="/dashboard/pacientes/novo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <UserPlus size={20} />
            Novo Paciente
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900/70">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900/70">Recentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recent}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900/70">Com Email</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withEmail}</p>
              </div>
              <Mail className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-900/70">Com Telefone</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withPhone}</p>
              </div>
              <Phone className="w-8 h-8 text-orange-600 opacity-50" />
            </div>
          </div>
        </div>
      </div>

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
                placeholder="Buscar por nome, telefone ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterStatus('recent')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterStatus === 'recent'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Recentes
              </button>
              <button
                onClick={() => setFilterStatus('old')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterStatus === 'old'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Antigos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {viewMode === 'cards' && (
        <div className="animate-in fade-in duration-300">
          {filteredPatients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map((patient, index) => (
                <div
                  key={patient.id}
                  className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getRandomColor(patient.full_name)} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                        {getInitials(patient.full_name)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{patient.full_name}</h3>
                        <p className="text-sm text-gray-500">
                          Cadastrado em {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {patient.email && (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Mail size={16} className="text-gray-400" />
                        <span className="truncate">{patient.email}</span>
                      </div>
                    )}
                    {patient.phone && (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Phone size={16} className="text-gray-400" />
                        <span>{patient.phone}</span>
                      </div>
                    )}
                    {!patient.email && !patient.phone && (
                      <p className="text-sm text-gray-400 italic">Sem contato cadastrado</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <Link
                      href={`/dashboard/pacientes/${patient.id}/editar`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                    >
                      <Edit size={16} />
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(patient)}
                      disabled={deleting === patient.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {deleting === patient.id ? '...' : 'Deletar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-700 font-semibold text-lg mb-2">Nenhum paciente encontrado</p>
              <p className="text-gray-500 mb-6">
                {searchTerm ? 'Tente ajustar sua busca' : 'Comece cadastrando seu primeiro paciente'}
              </p>
              {!searchTerm && (
                <Link
                  href="/dashboard/pacientes/novo"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <Plus size={20} />
                  Cadastrar Primeiro Paciente
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Paciente</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Email</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Telefone</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Cadastro</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getRandomColor(patient.full_name)} flex items-center justify-center text-white font-bold text-sm`}>
                            {getInitials(patient.full_name)}
                          </div>
                          <span className="font-semibold text-gray-900">{patient.full_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {patient.email ? (
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-gray-400" />
                            {patient.email}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {patient.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            {patient.phone}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(patient.created_at).toLocaleDateString("pt-BR")}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/dashboard/pacientes/${patient.id}/editar`}
                            className="text-blue-600 hover:text-blue-700 transition font-medium text-sm flex items-center gap-1"
                          >
                            <Edit size={16} />
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(patient)}
                            disabled={deleting === patient.id}
                            className="text-red-600 hover:text-red-700 transition font-medium text-sm flex items-center gap-1 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                            {deleting === patient.id ? "Deletando..." : "Deletar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredPatients.length === 0 && (
              <div className="py-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Nenhum paciente encontrado</p>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'stats' && (
        <div className="animate-in fade-in duration-300 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Distribuição por Período</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Últimos 30 dias</span>
                    <span className="text-sm font-bold text-gray-900">{stats.recent}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.recent / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Mais de 30 dias</span>
                    <span className="text-sm font-bold text-gray-900">{stats.total - stats.recent}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                      style={{ width: `${stats.total > 0 ? ((stats.total - stats.recent) / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Informações de Contato</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Com Email</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats.withEmail}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-gray-900">Com Telefone</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats.withPhone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Resumo Geral</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600 mt-1">Total</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-3xl font-bold text-gray-900">{stats.recent}</p>
                <p className="text-sm text-gray-600 mt-1">Recentes</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <p className="text-3xl font-bold text-gray-900">{stats.withEmail}</p>
                <p className="text-sm text-gray-600 mt-1">Com Email</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <p className="text-3xl font-bold text-gray-900">{stats.withPhone}</p>
                <p className="text-sm text-gray-600 mt-1">Com Telefone</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Counter */}
      {viewMode !== 'stats' && filteredPatients.length > 0 && (
        <div className="mt-6 text-sm text-gray-600 text-center">
          Mostrando <span className="font-semibold text-gray-900">{filteredPatients.length}</span> de{' '}
          <span className="font-semibold text-gray-900">{patients.length}</span> pacientes
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Deletar Paciente"
        message={`Tem certeza que deseja deletar o paciente "${patientToDelete?.full_name}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={deleting === patientToDelete?.id}
        isDangerous={true}
      />
    </div>
  )
}
