'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Trash2, AlertTriangle, Plus, X, Key, Clock, Users } from 'lucide-react'

interface TrialKey {
  id: string
  key_code: string
  plan_type?: string
  trial_days: number
  trial_hours?: number
  trial_minutes?: number
  trial_seconds?: number
  max_activations: number
  current_activations: number
  is_active: boolean
  expires_at: string | null
  created_at: string
  first_activation_at?: string | null
  trial_ends_at?: string | null
  time_remaining?: number | null
}

export default function TrialKeysPage() {
  return <TrialKeysContent />
}

function TrialKeysContent() {
  const [keys, setKeys] = useState<TrialKey[]>([])
  const [loading, setLoading] = useState(true)
  const [copying, setCopying] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; keyId: string | null; keyCode: string }>({
    isOpen: false,
    keyId: null,
    keyCode: '',
  })
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    plan_type: 'free_trial',
    trial_days: 14,
    max_activations: 1,
    trial_hours: 0,
    trial_minutes: 0,
    trial_seconds: 0,
  })

  const fetchKeys = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/admin/trial-keys`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setKeys(data.data || [])
      }
    } catch (error) {
      // Erro silencioso
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKeys()
  }, [])

  const generateKeyCode = () => {
    const timestamp = new Date().getTime().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 10).toUpperCase()
    return `TRIAL-${timestamp}-${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar que pelo menos uma duração seja maior que 0
    const totalDuration = 
      (formData.trial_days || 0) + 
      (formData.trial_hours || 0) + 
      (formData.trial_minutes || 0) + 
      (formData.trial_seconds || 0)
    
    if (totalDuration === 0) {
      alert('Por favor, defina pelo menos uma duração (dias, horas, minutos ou segundos) maior que zero.')
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const keyCode = generateKeyCode()
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/admin/trial-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key_code: keyCode,
          plan_type: formData.plan_type,
          trial_days: parseInt(formData.trial_days.toString()) || 0,
          max_activations: parseInt(formData.max_activations.toString()),
          trial_hours: parseInt(formData.trial_hours.toString()) || 0,
          trial_minutes: parseInt(formData.trial_minutes.toString()) || 0,
          trial_seconds: parseInt(formData.trial_seconds.toString()) || 0,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setKeys([data.data, ...keys])
        setFormData({ 
          plan_type: 'free_trial',
          trial_days: 14, 
          max_activations: 1,
          trial_hours: 0,
          trial_minutes: 0,
          trial_seconds: 0,
        })
        setShowForm(false)
      }
    } catch (error) {
      // Erro silencioso
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopying(text)
      setTimeout(() => setCopying(null), 2000)
    } catch (error) {
      // Erro silencioso
    }
  }

  const handleDeleteClick = (keyId: string, keyCode: string) => {
    setDeleteModal({
      isOpen: true,
      keyId,
      keyCode,
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.keyId) return

    setDeleting(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/admin/trial-keys/${deleteModal.keyId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setKeys(keys.filter((key) => key.id !== deleteModal.keyId))
        setDeleteModal({ isOpen: false, keyId: null, keyCode: '' })
      } else {
        const data = await response.json()
        alert(data.message || 'Erro ao deletar chave')
      }
    } catch (error) {
      console.error('Erro ao deletar chave:', error)
      alert('Erro ao deletar chave')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, keyId: null, keyCode: '' })
  }

  // Função para formatar tempo restante
  const formatTimeRemaining = (timeRemaining: number | null | undefined): string => {
    if (timeRemaining === null || timeRemaining === undefined || timeRemaining <= 0) {
      return '00:00:00'
    }

    const totalSeconds = Math.floor(timeRemaining / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  // Componente de timer regressivo
  const CountdownTimer = ({ trialKey }: { trialKey: TrialKey }) => {
    const [timeRemaining, setTimeRemaining] = useState<number | null>(trialKey.time_remaining ?? null)

    // Atualizar quando a chave mudar
    useEffect(() => {
      setTimeRemaining(trialKey.time_remaining ?? null)
    }, [trialKey.time_remaining])

    useEffect(() => {
      if (timeRemaining === null || timeRemaining <= 0) {
        return
      }

      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null) return null
          const newTime = prev - 1000
          return newTime > 0 ? newTime : 0
        })
      }, 1000)

      return () => clearInterval(interval)
    }, [timeRemaining])

    if (!trialKey.first_activation_at) {
      return <span className="text-gray-400">Não ativada</span>
    }

    if (timeRemaining === null || timeRemaining <= 0) {
      return <span className="text-red-600 font-semibold">Expirado</span>
    }

    return (
      <span className="font-mono font-semibold text-gray-900">
        {formatTimeRemaining(timeRemaining)}
      </span>
    )
  }

  const stats = {
    total: keys.length,
    active: keys.filter(k => k.is_active).length,
    inactive: keys.filter(k => !k.is_active).length,
    activated: keys.filter(k => k.current_activations > 0).length,
  }

  return (
    <>
      <div className={`w-full ${deleteModal.isOpen ? 'blur-sm pointer-events-none' : ''}`}>
        {/* Header Moderno */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Chaves de Teste 🔑</h1>
            <p className="text-lg text-gray-600">Gerencie as chaves de teste gratuito do sistema</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900/70">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Copy className="w-8 h-8 text-purple-600 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900/70">Ativas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
                <Check className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-900/70">Inativas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900/70">Ativadas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activated}</p>
                </div>
                <Check className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
            </div>
          </div>
        </div>

        {/* Botão para criar */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
        >
          {showForm ? (
            <>
              <X size={20} />
              Cancelar
            </>
          ) : (
            <>
              <Plus size={20} />
              Nova Chave
            </>
          )}
        </button>

        {/* Formulário */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Key size={24} className="text-purple-600" />
              Criar Nova Chave de Teste
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Plano
                </label>
                <select
                  value={formData.plan_type}
                  onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="free_trial">Free Trial</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Máx. Ativações
                </label>
                <input
                  type="number"
                  value={formData.max_activations}
                  onChange={(e) => setFormData({ ...formData, max_activations: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dias de Teste
              </label>
              <input
                type="number"
                value={formData.trial_days}
                onChange={(e) => setFormData({ ...formData, trial_days: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0"
                max="180"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Duração do Trial (a partir da primeira ativação)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Horas</label>
                  <input
                    type="number"
                    value={formData.trial_hours}
                    onChange={(e) => setFormData({ ...formData, trial_hours: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Minutos</label>
                  <input
                    type="number"
                    value={formData.trial_minutes}
                    onChange={(e) => setFormData({ ...formData, trial_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0"
                    max="59"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Segundos</label>
                  <input
                    type="number"
                    value={formData.trial_seconds}
                    onChange={(e) => setFormData({ ...formData, trial_seconds: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0"
                    max="59"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-end">
                  <p className="text-xs text-gray-500 mb-3">
                    O tempo começa a contar quando a chave for ativada pela primeira vez
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2"
            >
              <Key size={20} />
              Gerar Chave
            </button>
          </form>
        )}

        {/* Tabela de chaves */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando chaves...</p>
            </div>
          ) : keys.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                <Key className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-700 font-semibold text-lg mb-2">Nenhuma chave criada ainda</p>
              <p className="text-gray-500">Comece criando sua primeira chave de teste</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Tipo de Plano
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      TEMPO
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Ativações
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Duração
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Criada em
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {keys.map((key, index) => (
                    <tr 
                      key={key.id} 
                      className="hover:bg-gray-50 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-gray-900 text-sm">{key.key_code}</code>
                          <button
                            onClick={() => copyToClipboard(key.key_code)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Copiar"
                          >
                            {copying === key.key_code ? (
                              <Check size={16} className="text-green-600" />
                            ) : (
                              <Copy size={16} className="text-gray-600" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold border ${
                          key.plan_type === 'premium' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                          key.plan_type === 'professional' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                          key.plan_type === 'starter' ? 'bg-green-100 text-green-800 border-green-300' :
                          'bg-gray-100 text-gray-800 border-gray-300'
                        }`}>
                          {key.plan_type === 'premium' ? 'Premium' :
                           key.plan_type === 'professional' ? 'Professional' :
                           key.plan_type === 'starter' ? 'Starter' :
                           'Free Trial'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <CountdownTimer trialKey={key} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {key.current_activations}/{key.max_activations}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold border ${
                            key.is_active
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                          }`}
                        >
                          {key.is_active ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          {key.trial_days > 0 && <span className="font-medium">{key.trial_days}d</span>}
                          {(key.trial_hours || 0) > 0 && <span className="font-medium">{key.trial_hours}h</span>}
                          {(key.trial_minutes || 0) > 0 && <span className="font-medium">{key.trial_minutes}m</span>}
                          {(key.trial_seconds || 0) > 0 && <span className="font-medium">{key.trial_seconds}s</span>}
                          {!key.trial_days && !key.trial_hours && !key.trial_minutes && !key.trial_seconds && <span>0s</span>}
                        </div>
                        <span className="text-xs text-gray-500 block mt-1">
                          (a partir da 1ª ativação)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={14} className="text-gray-400" />
                          {new Date(key.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleDeleteClick(key.id, key.key_code)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600" 
                          title="Deletar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Delete */}
      {deleteModal.isOpen && (
        <>
          {/* Backdrop com blur no fundo */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={handleDeleteCancel}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 pointer-events-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirmar Exclusão
                </h3>
                <p className="text-sm text-gray-600">
                  Tem certeza que deseja deletar a chave{' '}
                  <span className="font-mono font-semibold text-gray-900">
                    {deleteModal.keyCode}
                  </span>
                  ?
                </p>
                <p className="text-xs text-red-600 mt-2">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deletando...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Deletar
                  </>
                )}
              </button>
            </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
