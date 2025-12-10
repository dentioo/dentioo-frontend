"use client"

import Link from "next/link"

import type React from "react"

import { useState } from "react"
import { Plus, Trash2, Send } from "lucide-react"

interface Procedure {
  id: string
  name: string
  quantity: number
  price: number
}

export function NewBudgetForm() {
  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    procedures: [] as Procedure[],
  })

  const [newProcedure, setNewProcedure] = useState({
    name: "",
    quantity: 1,
    price: 0,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const addProcedure = () => {
    if (newProcedure.name && newProcedure.price > 0) {
      // Generate ID using crypto for client-side only
      const randomId = typeof crypto !== 'undefined' 
        ? crypto.getRandomValues(new Uint8Array(4)).join('')
        : Math.random().toString(36).substring(2, 9)
      
      setFormData((prev) => ({
        ...prev,
        procedures: [
          ...prev.procedures,
          {
            id: randomId,
            ...newProcedure,
          },
        ],
      }))
      setNewProcedure({ name: "", quantity: 1, price: 0 })
    }
  }

  const removeProcedure = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      procedures: prev.procedures.filter((p) => p.id !== id),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Budget created:", formData)
      setSuccess(true)
    } finally {
      setIsLoading(false)
    }
  }

  const total = formData.procedures.reduce((sum, proc) => sum + proc.price * proc.quantity, 0)

  if (success) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm border border-color-neutral-light text-center">
        <div className="w-16 h-16 bg-color-success bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-color-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-color-primary mb-2">Orçamento criado com sucesso!</h2>
        <p className="text-gray-600 mb-6">O orçamento foi enviado para {formData.patientEmail}</p>
        <Link href="/dashboard/orcamentos" className="btn-primary inline-block">
          Voltar à lista
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Patient Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-color-neutral-light">
          <h2 className="text-lg font-bold text-color-primary mb-4">Informações do Paciente</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-color-primary mb-2">Nome do Paciente</label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => setFormData((prev) => ({ ...prev, patientName: e.target.value }))}
                placeholder="Ana Silva"
                className="w-full px-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-color-primary mb-2">Email</label>
              <input
                type="email"
                value={formData.patientEmail}
                onChange={(e) => setFormData((prev) => ({ ...prev, patientEmail: e.target.value }))}
                placeholder="ana@email.com"
                className="w-full px-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light"
                required
              />
            </div>
          </div>
        </div>

        {/* Procedures */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-color-neutral-light">
          <h2 className="text-lg font-bold text-color-primary mb-4">Procedimentos</h2>

          {/* Add Procedure */}
          <div className="space-y-4 mb-6 p-4 bg-color-bg-light rounded-lg">
            <div>
              <label className="block text-sm font-medium text-color-primary mb-2">Nome do Procedimento</label>
              <input
                type="text"
                value={newProcedure.name}
                onChange={(e) => setNewProcedure((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Limpeza Dental"
                className="w-full px-4 py-2 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-color-primary mb-2">Quantidade</label>
                <input
                  type="number"
                  value={newProcedure.quantity}
                  onChange={(e) =>
                    setNewProcedure((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 1 }))
                  }
                  className="w-full px-4 py-2 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-color-primary mb-2">Valor Unitário</label>
                <input
                  type="number"
                  value={newProcedure.price}
                  onChange={(e) =>
                    setNewProcedure((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addProcedure}
                  className="w-full btn-primary py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Adicionar
                </button>
              </div>
            </div>
          </div>

          {/* Procedures List */}
          <div className="space-y-2">
            {formData.procedures.map((proc) => (
              <div key={proc.id} className="flex items-center justify-between p-3 bg-color-bg-light rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{proc.name}</p>
                  <p className="text-sm text-gray-600">
                    {proc.quantity}x R$ {proc.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} = R${" "}
                    {(proc.quantity * proc.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeProcedure(proc.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {formData.procedures.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhum procedimento adicionado ainda</p>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-color-neutral-light sticky top-20 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Resumo</h3>

            <div className="space-y-2 pb-4 border-b border-color-neutral-light">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Impostos (0%)</span>
                <span className="font-medium">-</span>
              </div>
            </div>

            <div className="flex justify-between mt-4 mb-6">
              <span className="font-semibold text-lg text-color-primary">Total</span>
              <span className="text-2xl font-bold text-color-primary">
                R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || formData.procedures.length === 0 || !formData.patientName || !formData.patientEmail}
            className="w-full btn-primary py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            {isLoading ? "Enviando..." : "Criar e Enviar"}
          </button>

          <button type="button" className="w-full btn-secondary py-3 rounded-lg font-semibold">
            Salvar Rascunho
          </button>
        </div>
      </div>
    </form>
  )
}
