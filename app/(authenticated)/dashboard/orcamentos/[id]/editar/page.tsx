'use client'

import { useParams } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { BudgetEditForm } from "@/components/orcamentos/budget-edit-form"

export default function EditarOrcamentoPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <>
      <PageHeader
        title="Editar Orçamento"
        description="Atualize os dados do orçamento"
      />
      <BudgetEditForm budgetId={id} />
    </>
  )
}
