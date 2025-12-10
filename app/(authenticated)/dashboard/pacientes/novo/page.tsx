'use client'

import { PageHeader } from "@/components/ui/page-header"
import { PatientForm } from "@/components/pacientes/patient-form"

export default function NovoPacientePage() {
  return (
    <>
      <PageHeader
        title="Novo Paciente"
        description="Adicione um novo paciente ao seu sistema"
      />
      <PatientForm />
    </>
  )
}
