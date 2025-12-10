'use client'

import { PageHeader } from "@/components/ui/page-header"
import { AppointmentForm } from "@/components/agenda/appointment-form"

export default function NovoAgendamentoPage() {
  return (
    <>
      <PageHeader
        title="Novo Agendamento"
        description="Crie um novo agendamento para um paciente"
      />
      <AppointmentForm />
    </>
  )
}
