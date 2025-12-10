'use client'

import { PageHeader } from "@/components/ui/page-header"
import { SettingsForm } from "@/components/settings/settings-form"

export default function ConfiguracoesPage() {
  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações da sua clínica"
      />
      <SettingsForm />
    </div>
  )
}
