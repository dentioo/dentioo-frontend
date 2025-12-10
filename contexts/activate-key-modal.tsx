'use client'

import React, { createContext, useContext, useState } from 'react'

interface ActivateKeyModalContextType {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const ActivateKeyModalContext = createContext<ActivateKeyModalContextType | undefined>(undefined)

export function ActivateKeyModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <ActivateKeyModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </ActivateKeyModalContext.Provider>
  )
}

export function useActivateKeyModal() {
  const context = useContext(ActivateKeyModalContext)
  if (!context) {
    throw new Error('useActivateKeyModal must be used within ActivateKeyModalProvider')
  }
  return context
}
