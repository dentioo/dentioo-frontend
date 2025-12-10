'use client'

import { PageHeader } from "@/components/ui/page-header"
import { BudgetForm } from "@/components/orcamentos/budget-form"

export default function NovoOrcamentoPage() {
  return (
    <>
      <PageHeader
        title="Novo Orçamento"
        description="Crie um novo orçamento para um paciente"
      />
      <BudgetForm />
    </>
  )
}
