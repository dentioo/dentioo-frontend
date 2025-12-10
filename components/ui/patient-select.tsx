'use client'

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"

interface Patient {
  id: string
  full_name: string
  email?: string
  phone?: string
}

interface PatientSelectProps {
  value: string
  onChange: (patientId: string) => void
  label?: string
  required?: boolean
  placeholder?: string
}

export function PatientSelect({
  value,
  onChange,
  label = "Paciente",
  required = true,
  placeholder = "Selecione um paciente...",
}: PatientSelectProps) {
  const [patients, setPatientsData] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")

        if (!token) return

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const response = await fetch(`${apiUrl}/api/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error("Erro ao carregar pacientes")

        const result = await response.json()
        setPatientsData(result.data || [])
      } catch (err) {
        console.error("Erro ao carregar pacientes:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  useEffect(() => {
    if (value && patients.length > 0) {
      const patient = patients.find((p) => p.id === value)
      setSelectedPatient(patient || null)
    }
  }, [value, patients])

  const filteredPatients = patients.filter((patient) =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (patientId: string) => {
    onChange(patientId)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleClear = () => {
    onChange("")
    setSelectedPatient(null)
    setSearchTerm("")
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && "*"}
      </label>

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={selectedPatient ? selectedPatient.full_name : placeholder}
            value={isOpen ? searchTerm : ""}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-full pl-10 pr-10 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary"
          />
          {selectedPatient && !isOpen && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-color-neutral-light rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-gray-500">Carregando pacientes...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-3 text-center text-gray-500">Nenhum paciente encontrado</div>
            ) : (
              filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelect(patient.id)}
                  className="w-full px-4 py-2 text-left hover:bg-blue-50 transition border-b border-color-neutral-light last:border-b-0"
                >
                  <p className="font-medium text-gray-900">{patient.full_name}</p>
                  {patient.phone && (
                    <p className="text-xs text-gray-500">{patient.phone}</p>
                  )}
                </button>
              ))
            )}
          </div>
        )}

        {/* Fechar dropdown ao clicar fora */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
