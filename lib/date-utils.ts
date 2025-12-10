/**
 * Utilitários para formatação de datas e horários
 * Garante que as datas sejam exibidas corretamente considerando timezone local
 */

/**
 * Formata uma data/hora ISO string para exibição de hora (HH:MM)
 * Trata corretamente as conversões de timezone
 */
export function formatTime(dateString: string): string {
  try {
    // Se a string não termina com Z, assume que já está no timezone local
    // Se termina com Z (UTC), precisa converter para local
    const date = new Date(dateString)
    
    // Obter componentes locais da data (já convertida automaticamente pelo navegador)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    return `${hours}:${minutes}`
  } catch (error) {
    console.error('Erro ao formatar hora:', error)
    return dateString
  }
}

/**
 * Formata uma data/hora ISO string para exibição de data e hora (DD/MM/YYYY HH:MM)
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    console.error('Erro ao formatar data/hora:', error)
    return dateString
  }
}

/**
 * Formata uma data/hora ISO string para exibição de data (DD/MM/YYYY)
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
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
 */
export function formatDateShort(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    })
  } catch (error) {
    console.error('Erro ao formatar data curta:', error)
    return dateString
  }
}

/**
 * Converte uma data/hora ISO string para formato datetime-local (YYYY-MM-DDTHH:mm)
 * Usado em inputs type="datetime-local"
 */
export function toDateTimeLocal(dateString: string): string {
  try {
    const date = new Date(dateString)
    
    // Obter componentes locais
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch (error) {
    console.error('Erro ao converter para datetime-local:', error)
    return dateString.slice(0, 16) // Fallback: pegar apenas os primeiros 16 caracteres
  }
}

