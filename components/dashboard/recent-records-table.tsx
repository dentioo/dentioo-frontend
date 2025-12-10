"use client"

import Link from "next/link"

interface Record {
  id: string
  patientName: string
  date: string
  procedure: string
  status: "completed" | "pending" | "cancelled"
  value: string
}

const records: Record[] = [
  {
    id: "1",
    patientName: "Ana Silva",
    date: "20/11/2024",
    procedure: "Limpeza Dental",
    status: "completed",
    value: "R$ 150",
  },
  {
    id: "2",
    patientName: "Carlos Santos",
    date: "20/11/2024",
    procedure: "Restauração",
    status: "completed",
    value: "R$ 280",
  },
  {
    id: "3",
    patientName: "Maria Costa",
    date: "19/11/2024",
    procedure: "Consulta de Avaliação",
    status: "pending",
    value: "R$ 120",
  },
  {
    id: "4",
    patientName: "João Pereira",
    date: "19/11/2024",
    procedure: "Extração",
    status: "completed",
    value: "R$ 350",
  },
  {
    id: "5",
    patientName: "Isabel Martins",
    date: "18/11/2024",
    procedure: "Limpeza + Restauração",
    status: "completed",
    value: "R$ 380",
  },
]

const statusBadgeColor = {
  completed: "bg-color-success bg-opacity-10 text-color-success",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusLabel = {
  completed: "Concluído",
  pending: "Pendente",
  cancelled: "Cancelado",
}

export function RecentRecordsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-color-neutral-light">
            <th className="text-left py-3 px-4 font-semibold text-color-primary">Paciente</th>
            <th className="text-left py-3 px-4 font-semibold text-color-primary">Data</th>
            <th className="text-left py-3 px-4 font-semibold text-color-primary">Procedimento</th>
            <th className="text-left py-3 px-4 font-semibold text-color-primary">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-color-primary">Valor</th>
            <th className="text-left py-3 px-4 font-semibold text-color-primary">Ação</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr
              key={record.id}
              className="border-b border-color-neutral-light hover:bg-color-bg-light transition-colors"
            >
              <td className="py-3 px-4 text-gray-900 font-medium">{record.patientName}</td>
              <td className="py-3 px-4 text-gray-600">{record.date}</td>
              <td className="py-3 px-4 text-gray-600">{record.procedure}</td>
              <td className="py-3 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadgeColor[record.status]}`}>
                  {statusLabel[record.status]}
                </span>
              </td>
              <td className="py-3 px-4 font-medium text-color-primary">{record.value}</td>
              <td className="py-3 px-4">
                <Link
                  href={`/pacientes/${record.id}`}
                  className="text-color-primary-light hover:text-color-primary transition text-sm font-medium"
                >
                  Abrir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
