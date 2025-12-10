import type { Metadata } from 'next'
import React from 'react'
import { DashboardRootLayoutClient } from './dashboard-layout-client'

export const metadata: Metadata = {
  title: 'Dentioo - Dashboard',
  description: 'Dashboard da clínica odontológica',
}

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardRootLayoutClient>{children}</DashboardRootLayoutClient>
}
