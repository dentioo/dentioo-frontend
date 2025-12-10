import type { Metadata } from 'next'
import { AdminLayoutClient } from './admin-layout-client'

export const metadata: Metadata = {
  title: 'Dentioo - Admin',
  description: 'Painel administrativo Dentioo',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
