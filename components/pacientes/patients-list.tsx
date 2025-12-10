"use client"

import { useState, useEffect } from "react"
import { Search, Phone, Calendar, Building2, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ConfirmModal } from "@/components/ui/confirm-modal"

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

export function PatientsList() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)

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
      (patient.phone && patient.phone.includes(searchTerm))
    
    // TODO: Implementar lógica de status quando houver campo status no banco
    // const matchStatus = filterStatus === "all" || patient.status === filterStatus
    // return matchSearch && matchStatus
    
    return matchSearch
  })

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-color-neutral-light">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg transition text-color-primary cursor-pointer ${
                filterStatus === "all"
                  ? "bg-blue-100 border border-color-primary"
                  : "border border-color-neutral-light"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-4 py-2 rounded-lg transition text-color-primary cursor-pointer ${
                filterStatus === "active"
                  ? "bg-blue-100 border border-color-primary"
                  : "border border-color-neutral-light"
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setFilterStatus("inactive")}
              className={`px-4 py-2 rounded-lg transition text-color-primary cursor-pointer ${
                filterStatus === "inactive"
                  ? "bg-blue-100 border border-color-primary"
                  : "border border-color-neutral-light"
              }`}
            >
              Inativos
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando pacientes...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Patients Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-color-neutral-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-color-bg-light border-b border-color-neutral-light">
                  <th className="text-left py-4 px-6 font-semibold text-color-primary">Nome</th>
                  <th className="text-left py-4 px-6 font-semibold text-color-primary">Email</th>
                  <th className="text-left py-4 px-6 font-semibold text-color-primary">Telefone</th>
                  <th className="text-left py-4 px-6 font-semibold text-color-primary">Data de Cadastro</th>
                  <th className="text-left py-4 px-6 font-semibold text-color-primary">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-color-neutral-light hover:bg-color-bg-light transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-gray-900">{patient.full_name}</td>
                    <td className="py-4 px-6 text-gray-600">{patient.email || "-"}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {patient.phone ? (
                        <span className="flex items-center gap-2">
                          <Phone size={16} className="text-gray-400" />
                          {patient.phone}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {new Date(patient.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-4 px-6 flex items-center gap-3">
                      <Link
                        href={`/dashboard/pacientes/${patient.id}/editar`}
                        className="text-blue-600 hover:text-blue-800 transition font-medium text-sm flex items-center gap-1"
                      >
                        <Edit size={16} />
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(patient)}
                        disabled={deleting === patient.id}
                        className="text-red-600 hover:text-red-800 transition font-medium text-sm flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 size={16} />
                        {deleting === patient.id ? "Deletando..." : "Deletar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPatients.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500">Nenhum paciente encontrado</p>
            </div>
          )}
        </div>
      )}

      {!loading && !error && (
        <div className="text-sm text-gray-500">
          {filteredPatients.length} de {patients.length} pacientes
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
