'use client'

import { PageHeader } from "@/components/ui/page-header"
import { PatientEditForm } from "@/components/pacientes/patient-edit-form"
import { useParams } from "next/navigation"

export default function EditarPacientePage() {
  const params = useParams()
  const patientId = params?.id as string

  return (
    <>
      <PageHeader
        title="Editar Paciente"
        description="Atualize os dados do paciente"
      />
      {patientId && <PatientEditForm patientId={patientId} />}
    </>
  )
}
