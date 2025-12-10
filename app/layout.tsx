import type React from "react"
import type { Metadata } from "next"
import { Fustat } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { CookiesBanner } from "@/components/cookies-banner"
import { ActivateKeyModalProvider } from "@/contexts/activate-key-modal"
import { ActivateKeyModal } from "@/components/trial/activate-key-modal"
import "./globals.css"

const fustat = Fustat({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dentioo - Gestão de Clínica Odontológica",
  description:
    "A maneira mais fácil de gerenciar sua clínica odontológica. Agenda, pacientes, prontuários, orçamentos e gestão — tudo em um só lugar.",
  generator: "dentioo-app",
  icons: {
    icon: [
      {
        url: "https://i.ibb.co/spbyHVwM/d85c195c-8521-40c3-862d-26101de8d716-Copia.png",
        type: "image/png",
      },
    ],
    apple: "https://i.ibb.co/spbyHVwM/d85c195c-8521-40c3-862d-26101de8d716-Copia.png",
    shortcut: "https://i.ibb.co/spbyHVwM/d85c195c-8521-40c3-862d-26101de8d716-Copia.png",
  },
}

export const viewport = {
  themeColor: "#0D3B66",
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="h-screen">
      <body 
        className={`${fustat.className} font-sans antialiased h-screen`}
        suppressHydrationWarning
      >
        <ActivateKeyModalProvider>
          {children}
          <ActivateKeyModal />
          <CookiesBanner />
        </ActivateKeyModalProvider>
        <Analytics />
      </body>
    </html>
  )
}
