/**
 * Utilitários para formatação de datas e horários
 * Garante que as datas sejam exibidas corretamente em horário de Brasília (UTC-3)
 */

/**
 * Formata uma data/hora ISO string para exibição de hora (HH:MM)
 * Converte de UTC para horário de Brasília (UTC-3)
 */
export function formatTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    
    // Usar Intl.DateTimeFormat para ter controle total do formato
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    
    // Formatar e extrair apenas HH:MM
    const parts = formatter.formatToParts(date)
    const hour = parts.find(p => p.type === 'hour')?.value || '00'
    const minute = parts.find(p => p.type === 'minute')?.value || '00'
    
    return `${hour}:${minute}`
  } catch (error) {
    console.error('Erro ao formatar hora:', error)
    return dateString
  }
}

/**
 * Formata uma data/hora ISO string para exibição de data e hora (DD/MM/YYYY HH:MM)
 * Converte de UTC para horário de Brasília (UTC-3)
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    
    return date.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch (error) {
    console.error('Erro ao formatar data/hora:', error)
    return dateString
  }
}

/**
 * Formata uma data/hora ISO string para exibição de data (DD/MM/YYYY)
 * Converte de UTC para horário de Brasília (UTC-3) para garantir a data correta
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    
    return date.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return dateString
  }
}

/**
 * Formata uma data/hora ISO string para exibição de data curta (dia mês)
 * Converte de UTC para horário de Brasília (UTC-3) para garantir a data correta
 */
export function formatDateShort(dateString: string): string {
  try {
    const date = new Date(dateString)
    
    // Obter componentes da data em timezone de São Paulo
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    })
    
    return formatter.format(date)
  } catch (error) {
    console.error('Erro ao formatar data curta:', error)
    return dateString
  }
}

/**
 * Converte uma data/hora ISO string para formato datetime-local (YYYY-MM-DDTHH:mm)
 * Usado em inputs type="datetime-local"
 * Converte de UTC para horário de Brasília antes de formatar
 */
export function toDateTimeLocal(dateString: string): string {
  try {
    const date = new Date(dateString)
    
    // Converter para horário de Brasília primeiro
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    
    const parts = formatter.formatToParts(date)
    const year = parts.find(p => p.type === 'year')?.value || ''
    const month = parts.find(p => p.type === 'month')?.value || ''
    const day = parts.find(p => p.type === 'day')?.value || ''
    const hour = parts.find(p => p.type === 'hour')?.value || ''
    const minute = parts.find(p => p.type === 'minute')?.value || ''
    
    return `${year}-${month}-${day}T${hour}:${minute}`
  } catch (error) {
    console.error('Erro ao converter para datetime-local:', error)
    return dateString.slice(0, 16) // Fallback: pegar apenas os primeiros 16 caracteres
  }
}

/**
 * Converte um datetime-local (YYYY-MM-DDTHH:mm) para ISO string UTC
 * Assume que o datetime-local está em horário de Brasília (UTC-3)
 * Usado antes de enviar dados para o backend
 */
export function fromDateTimeLocalToUTC(datetimeLocal: string): string {
  try {
    if (!datetimeLocal) return datetimeLocal
    
    // datetime-local vem no formato YYYY-MM-DDTHH:mm (sem timezone)
    // Assumimos que está em horário de Brasília (UTC-3)
    const [datePart, timePart] = datetimeLocal.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hours, minutes] = timePart.split(':').map(Number)
    
    // Criar data como se fosse UTC, mas ajustar para Brasília
    // Horário de Brasília = UTC - 3 horas
    // Então UTC = Horário de Brasília + 3 horas
    const dateUTC = new Date(Date.UTC(year, month - 1, day, hours, minutes))
    
    // Adicionar 3 horas para converter de Brasília para UTC
    const dateWithOffset = new Date(dateUTC.getTime() + 3 * 60 * 60 * 1000)
    
    return dateWithOffset.toISOString()
  } catch (error) {
    console.error('Erro ao converter datetime-local para UTC:', error)
    return datetimeLocal
  }
}

