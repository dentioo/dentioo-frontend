"use client"

import { useState } from "react"
import { FileText, Calendar, Archive, MessageSquare, Send, Download } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

interface PatientDetailsProps {
  patientId: string
}

type Tab = "informacoes" | "prontuario" | "consultas" | "arquivos"

export function PatientDetails({ patientId }: PatientDetailsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("informacoes")
  const [newNote, setNewNote] = useState("")

  // Mock data
  const patient = {
    id: patientId,
    name: "Ana Silva",
    age: 32,
    cpf: "123.456.789-00",
    phone: "(11) 98765-4321",
    email: "ana@email.com",
    insurance: "Unimed",
    insuranceNumber: "123456789",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    lastAppointment: "20/11/2024",
    nextAppointment: "27/11/2024",
  }

  const notes = [
    {
      id: "1",
      date: "20/11/2024",
      author: "Dr. Silva",
      content: "Paciente apresentou boa evolução no tratamento. Continuar com procedimento programado.",
    },
    {
      id: "2",
      date: "15/11/2024",
      author: "Dr. Silva",
      content: "Restauração realizada com sucesso. Agendar retorno em 2 semanas.",
    },
  ]

  const appointments = [
    {
      id: "1",
      date: "20/11/2024",
      time: "14:30",
      procedure: "Limpeza Dental",
      status: "completed",
      notes: "Paciente cooperador, sem complicações",
    },
    {
      id: "2",
      date: "18/10/2024",
      time: "10:00",
      procedure: "Consulta de Avaliação",
      status: "completed",
      notes: "Avaliação inicial, foi recomendado tratamento",
    },
  ]

  const files = [
    {
      id: "1",
      name: "Radiografia Panorâmica.pdf",
      date: "20/11/2024",
      size: "2.4 MB",
      type: "PDF",
    },
    {
      id: "2",
      name: "Tomografia 3D.pdf",
      date: "18/10/2024",
      size: "15.8 MB",
      type: "PDF",
    },
  ]

  return (
    <div className="space-y-8">
      <PageHeader title={patient.name} description={`Paciente desde ${patient.lastAppointment}`} />

      {/* Tabs */}
      <div className="flex gap-4 border-b border-color-neutral-light">
        <button
          onClick={() => setActiveTab("informacoes")}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "informacoes"
              ? "border-color-primary text-color-primary"
              : "border-transparent text-gray-600 hover:text-color-primary"
          }`}
        >
          Informações
        </button>
        <button
          onClick={() => setActiveTab("prontuario")}
          className={`px-4 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "prontuario"
              ? "border-color-primary text-color-primary"
              : "border-transparent text-gray-600 hover:text-color-primary"
          }`}
        >
          <FileText size={18} />
          Prontuário
        </button>
        <button
          onClick={() => setActiveTab("consultas")}
          className={`px-4 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "consultas"
              ? "border-color-primary text-color-primary"
              : "border-transparent text-gray-600 hover:text-color-primary"
          }`}
        >
          <Calendar size={18} />
          Consultas
        </button>
        <button
          onClick={() => setActiveTab("arquivos")}
          className={`px-4 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "arquivos"
              ? "border-color-primary text-color-primary"
              : "border-transparent text-gray-600 hover:text-color-primary"
          }`}
        >
          <Archive size={18} />
          Arquivos
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "informacoes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-color-neutral-light">
              <h3 className="text-lg font-bold text-color-primary mb-4">Dados Pessoais</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">CPF</p>
                  <p className="font-medium">{patient.cpf}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Idade</p>
                  <p className="font-medium">{patient.age} anos</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium">{patient.phone}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-color-neutral-light">
              <h3 className="text-lg font-bold text-color-primary mb-4">Endereço</h3>
              <div className="space-y-2">
                <p>
                  <span className="text-sm text-gray-600">Rua: </span>
                  <span className="font-medium">{patient.address}</span>
                </p>
                <p>
                  <span className="text-sm text-gray-600">Cidade: </span>
                  <span className="font-medium">{patient.city}</span>
                </p>
                <p>
                  <span className="text-sm text-gray-600">Estado: </span>
                  <span className="font-medium">{patient.state}</span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-color-neutral-light">
              <h3 className="text-lg font-bold text-color-primary mb-4">Convênio</h3>
              <div className="space-y-2">
                <p>
                  <span className="text-sm text-gray-600">Operadora: </span>
                  <span className="font-medium">{patient.insurance}</span>
                </p>
                <p>
                  <span className="text-sm text-gray-600">Número: </span>
                  <span className="font-medium">{patient.insuranceNumber}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-color-neutral-light h-fit sticky top-20">
            <h3 className="text-lg font-bold text-color-primary mb-4">Próximas Consultas</h3>
            <div className="space-y-3">
              <div className="bg-color-primary-light bg-opacity-10 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Próxima consulta</p>
                <p className="font-semibold text-color-primary">{patient.nextAppointment}</p>
              </div>
              <button className="w-full btn-primary py-2 rounded-lg text-sm">Agendar Consulta</button>
              <button className="w-full btn-secondary py-2 rounded-lg text-sm">Enviar Orçamento</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "prontuario" && (
        <div className="space-y-6">
          {/* Add Note */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-color-neutral-light">
            <h3 className="text-lg font-bold text-color-primary mb-4 flex items-center gap-2">
              <MessageSquare size={20} />
              Adicionar Anotação
            </h3>
            <div className="flex gap-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Escreva uma anotação sobre o paciente..."
                className="flex-1 px-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light resize-none"
                rows={3}
              />
              <button className="btn-primary px-4 py-2 rounded-lg self-end">
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-white rounded-xl p-6 shadow-sm border border-color-neutral-light">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-color-primary">{note.author}</h4>
                  <span className="text-sm text-gray-500">{note.date}</span>
                </div>
                <p className="text-gray-700">{note.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "consultas" && (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-xl p-6 shadow-sm border border-color-neutral-light">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-color-primary">{apt.procedure}</h4>
                  <p className="text-sm text-gray-600">
                    {apt.date} às {apt.time}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-color-success bg-opacity-10 text-color-success">
                  Concluído
                </span>
              </div>
              <p className="text-gray-700">{apt.notes}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "arquivos" && (
        <div className="space-y-4">
          <button className="w-full border-2 border-dashed border-color-neutral-light rounded-xl p-8 text-center hover:bg-color-bg-light transition">
            <Archive className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="font-medium text-color-primary">Clique para fazer upload</p>
            <p className="text-sm text-gray-600">ou arraste um arquivo</p>
          </button>

          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-color-neutral-light flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600">{file.type}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {file.size} • {file.date}
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Download size={18} className="text-color-primary" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
