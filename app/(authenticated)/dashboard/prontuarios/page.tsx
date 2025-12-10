'use client'

import { useState, useEffect, useRef } from "react"
import { 
  Search, 
  Plus, 
  FileText, 
  Edit, 
  Trash2,
  Calendar,
  User,
  Save,
  X,
  ClipboardList,
  Clock,
  Filter,
  Grid3x3,
  List,
  BarChart3,
  Phone,
  ChevronDown,
  Download,
  Printer,
  FileDown,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from "lucide-react"
import { useRouter } from "next/navigation"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'

type ViewMode = 'cards' | 'list' | 'stats'

interface PatientRecord {
  id: string
  patient_id: string
  patient_name?: string
  title: string | null
  content: string | null
  record_type: string | null
  diagnosis: string | null
  treatment_plan: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

interface Patient {
  id: string
  full_name: string
  phone: string
}

interface ClinicData {
  clinic_name: string
  clinic_email: string
  clinic_phone: string
}

export default function ProntuariosPage() {
  const router = useRouter()
  const editorRef = useRef<HTMLDivElement>(null)
  const [records, setRecords] = useState<PatientRecord[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [clinicData, setClinicData] = useState<ClinicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [showEditor, setShowEditor] = useState(false)
  const [editingRecord, setEditingRecord] = useState<PatientRecord | null>(null)
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [recordTitle, setRecordTitle] = useState("")
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<PatientRecord | null>(null)
  const [patientSearchQuery, setPatientSearchQuery] = useState("")
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const patientSearchRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const previewPagesRef = useRef<HTMLDivElement>(null)
  const [previewPages, setPreviewPages] = useState<number[]>([])

  useEffect(() => {
    fetchRecords()
    fetchPatients()
    fetchClinicData()
  }, [])

  const fetchClinicData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/user/clinic`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const result = await response.json()
        setClinicData(result.data || null)
      } else {
        // Fallback para dados do localStorage
        const userStr = localStorage.getItem("user")
        if (userStr) {
          const user = JSON.parse(userStr)
          setClinicData({
            clinic_name: user.clinic_name || "Minha Clínica",
            clinic_email: user.email || "contato@clinica.com.br",
            clinic_phone: user.phone || "(11) 3000-0000",
          })
        }
      }
    } catch (err) {
      // Erro silencioso
      // Fallback para dados do localStorage
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const user = JSON.parse(userStr)
        setClinicData({
          clinic_name: user.clinic_name || "Minha Clínica",
          clinic_email: user.email || "contato@clinica.com.br",
          clinic_phone: user.phone || "(11) 3000-0000",
        })
      }
    }
  }

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (patientSearchRef.current && !patientSearchRef.current.contains(event.target as Node)) {
        setShowPatientDropdown(false)
      }
    }

    if (showPatientDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPatientDropdown])

  // Atualizar pré-visualização em tempo real com cálculo de páginas
  useEffect(() => {
    if (showEditor && editorRef.current) {
      const updatePreview = () => {
        if (editorRef.current) {
          const content = editorRef.current.innerHTML
          
          // Atualizar conteúdo imediatamente
          const allContentDivs = document.querySelectorAll('.preview-content')
          const contentToShow = content || '<p style="color: #9ca3af; font-style: italic;">Digite o conteúdo do prontuário...</p>'
          allContentDivs.forEach((div) => {
            if (div instanceof HTMLElement) {
              div.innerHTML = contentToShow
            }
          })
          
          // Calcular número de páginas
          const pageHeightPx = 1123 - 40 // Altura disponível para conteúdo
          const pageWidthPx = 794 // Largura A4 em pixels (96 DPI)
          
          // Criar um elemento temporário para medir o conteúdo
          const tempDiv = document.createElement('div')
          tempDiv.style.position = 'absolute'
          tempDiv.style.visibility = 'hidden'
          tempDiv.style.width = `${pageWidthPx}px`
          tempDiv.style.fontFamily = "'Fustat', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
          tempDiv.style.fontSize = '12pt'
          tempDiv.style.lineHeight = '1.6'
          tempDiv.style.padding = '20px'
          tempDiv.innerHTML = content || ''
          document.body.appendChild(tempDiv)
          
          // Altura do header fixo (logo, título, paciente)
          const headerHeight = 200 // Aproximadamente
          const totalContentHeight = tempDiv.scrollHeight + headerHeight
          const numberOfPages = Math.max(1, Math.ceil(totalContentHeight / pageHeightPx))
          
          document.body.removeChild(tempDiv)
          
          // Atualizar array de páginas
          setPreviewPages(Array.from({ length: numberOfPages }, (_, i) => i + 1))
        }
      }

      // Atualizar quando o conteúdo mudar
      const observer = new MutationObserver(() => {
        updatePreview()
      })
      if (editorRef.current) {
        observer.observe(editorRef.current, {
          childList: true,
          subtree: true,
          characterData: true,
        })
      }

      // Atualizar também em eventos de input
      const handleInput = () => updatePreview()
      const handleKeyUp = () => updatePreview()
      const handlePaste = () => setTimeout(updatePreview, 10)
      if (editorRef.current) {
        editorRef.current.addEventListener('input', handleInput)
        editorRef.current.addEventListener('keyup', handleKeyUp)
        editorRef.current.addEventListener('paste', handlePaste)
      }

      // Inicializar com pelo menos uma página
      if (previewPages.length === 0) {
        setPreviewPages([1])
      }

      // Atualização inicial
      setTimeout(updatePreview, 100)

      return () => {
        observer.disconnect()
        if (editorRef.current) {
          editorRef.current.removeEventListener('input', handleInput)
          editorRef.current.removeEventListener('keyup', handleKeyUp)
          editorRef.current.removeEventListener('paste', handlePaste)
        }
      }
    }
  }, [showEditor, recordTitle, selectedPatientId])

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.replace("/login")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/patient-records`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.replace("/login")
          return
        }
        throw new Error("Erro ao carregar prontuários")
      }

      const result = await response.json()
      setRecords(result.data || [])
      setLoading(false)
    } catch (err) {
      // Erro silencioso
      setError("Erro ao carregar dados")
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const result = await response.json()
        setPatients(result.data || [])
      }
    } catch (err) {
      // Erro silencioso
    }
  }

  const handleSave = async () => {
    if (!selectedPatientId) {
      alert("Selecione um paciente")
      return
    }

    if (!recordTitle.trim()) {
      alert("Digite um título para o prontuário")
      return
    }

    const content = editorRef.current?.innerHTML || ""

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.replace("/login")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const url = editingRecord 
        ? `${apiUrl}/api/patient-records/${editingRecord.id}`
        : `${apiUrl}/api/patient-records`

      const response = await fetch(url, {
        method: editingRecord ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          title: recordTitle,
          content: content,
          record_type: 'prontuario_digital',
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar prontuário")
      }

      setShowEditor(false)
      setEditingRecord(null)
      setRecordTitle("")
      setSelectedPatientId("")
      setPatientSearchQuery("")
      setShowPatientDropdown(false)
      if (editorRef.current) {
        editorRef.current.innerHTML = ""
      }
      fetchRecords()
    } catch (err) {
      // Erro silencioso
      alert("Erro ao salvar prontuário")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (record: PatientRecord) => {
    setEditingRecord(record)
    setRecordTitle(record.title || "")
    setSelectedPatientId(record.patient_id)
    setPatientSearchQuery("")
    setShowEditor(true)
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = record.content || ""
      }
    }, 100)
  }

  const handleDelete = async () => {
    if (!recordToDelete) return

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.replace("/login")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/patient-records/${recordToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("Erro ao deletar prontuário")
      }

      setShowDeleteModal(false)
      setRecordToDelete(null)
      fetchRecords()
    } catch (err) {
      // Erro silencioso
      alert("Erro ao deletar prontuário")
    }
  }

  const formatToolbar = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  // Exportar para PDF
  const handleExportPDF = async (record?: PatientRecord) => {
    const title = record?.title || recordTitle
    const content = record?.content || editorRef.current?.innerHTML || ""
    const patientName = record?.patient_name || selectedPatient?.full_name || ""
    // Buscar telefone do paciente: primeiro do record (se tiver patient_id), depois do selectedPatient
    let patientPhone = ""
    if (record?.patient_id) {
      const recordPatient = patients.find(p => p.id === record.patient_id)
      patientPhone = recordPatient?.phone || ""
    }
    if (!patientPhone) {
      patientPhone = selectedPatient?.phone || ""
    }

    if (!title || !content) {
      alert("Salve o prontuário antes de exportar")
      return
    }

    try {
      // Função para limpar HTML preservando formatação, mas removendo classes problemáticas
      const cleanHTML = (html: string): string => {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html
        
        // Normalizar quebras de linha: converter divs vazios e divs com apenas espaços em <br>
        // Processar de trás para frente para evitar problemas com a remoção
        const allDivs = Array.from(tempDiv.querySelectorAll('div')).reverse()
        allDivs.forEach((div) => {
          const textContent = div.textContent || ''
          const hasOnlyWhitespace = !textContent.trim() && div.children.length === 0
          
          if (hasOnlyWhitespace) {
            const br = document.createElement('br')
            if (div.parentNode) {
              div.parentNode.replaceChild(br, div)
            }
          } else {
            // Se o div tem conteúdo, adicionar <br> antes dele (exceto se já houver um)
            const prevSibling = div.previousSibling
            if (prevSibling && prevSibling.nodeType === Node.ELEMENT_NODE) {
              const prevEl = prevSibling as HTMLElement
              if (prevEl.tagName.toLowerCase() !== 'br') {
                const br = document.createElement('br')
                div.parentNode?.insertBefore(br, div)
              }
            }
          }
        })
        
        // Também converter <p> vazios em <br>
        const allP = Array.from(tempDiv.querySelectorAll('p')).reverse()
        allP.forEach((p) => {
          const textContent = p.textContent || ''
          const hasOnlyWhitespace = !textContent.trim() && p.children.length === 0
          
          if (hasOnlyWhitespace) {
            const br = document.createElement('br')
            if (p.parentNode) {
              p.parentNode.replaceChild(br, p)
            }
          } else {
            // Se o p tem conteúdo, adicionar <br> antes dele (exceto se já houver um)
            const prevSibling = p.previousSibling
            if (prevSibling && prevSibling.nodeType === Node.ELEMENT_NODE) {
              const prevEl = prevSibling as HTMLElement
              if (prevEl.tagName.toLowerCase() !== 'br') {
                const br = document.createElement('br')
                p.parentNode?.insertBefore(br, p)
              }
            }
          }
        })
        
        // Remover classes e estilos problemáticos, mas preservar formatação básica e quebras de linha
        const allElements = tempDiv.querySelectorAll('*')
        allElements.forEach((el: Element) => {
          const htmlEl = el as HTMLElement
          // Não remover <br>
          if (htmlEl.tagName.toLowerCase() === 'br') {
            return
          }
          htmlEl.removeAttribute('class')
          // Remover apenas estilos inline problemáticos, preservar formatação básica
          const style = htmlEl.getAttribute('style')
          if (style) {
            // Remover estilos que podem causar problemas, mas preservar formatação
            const cleanedStyle = style
              .replace(/color:\s*[^;]+;?/gi, '') // Remover cores problemáticas
              .replace(/background[^;]*;?/gi, '') // Remover backgrounds
              .replace(/margin[^;]*;?/gi, '') // Remover margins
              .replace(/padding[^;]*;?/gi, '') // Remover paddings
            if (cleanedStyle.trim()) {
              htmlEl.setAttribute('style', cleanedStyle)
            } else {
              htmlEl.removeAttribute('style')
            }
          }
        })
        
        return tempDiv.innerHTML
      }

      // Criar um iframe isolado para renderizar sem CSS externo
      const iframe = document.createElement('iframe')
      iframe.style.position = 'absolute'
      iframe.style.left = '-9999px'
      iframe.style.width = '800px'
      iframe.style.height = '1200px'
      iframe.style.border = 'none'
      iframe.style.margin = '0'
      iframe.style.padding = '0'
      document.body.appendChild(iframe)

      // Aguardar iframe carregar
      await new Promise(resolve => {
        iframe.onload = resolve
        iframe.src = 'about:blank'
      })

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) {
        throw new Error('Não foi possível acessar o documento do iframe')
      }

      // Limpar HTML preservando formatação
      let cleanedContent = cleanHTML(content)
      
      // Garantir que elementos de bloco sejam tratados como quebras de linha
      // Converter todos os </div> e </p> em <br> antes do fechamento
      cleanedContent = cleanedContent
        .replace(/<\/div>/gi, '<br></div>')
        .replace(/<\/p>/gi, '<br></p>')
        // Remover <br> duplicados
        .replace(/(<br\s*\/?>){2,}/gi, '<br>')
      
      // Obter telefone do paciente - buscar do record usando patient_id
      let finalPatientPhone = patientPhone
      if (record?.patient_id && !finalPatientPhone) {
        const recordPatient = patients.find(p => p.id === record.patient_id)
        finalPatientPhone = recordPatient?.phone || ""
      }
      
      iframeDoc.open()
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Fustat:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              html {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                overflow: visible;
                position: relative;
              }
              body {
                margin: 0;
                padding: 20px;
                padding-right: 30px;
                width: 800px;
                font-family: 'Fustat', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                font-size: 12pt;
                line-height: 1.6;
                color: #000000;
                background-color: #ffffff;
                word-wrap: break-word;
                overflow-wrap: break-word;
                position: relative;
              }
              .header {
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #333333;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 20px;
              }
              .header-left {
                display: flex;
                flex-direction: column;
                gap: 5px;
                flex: 1;
                min-width: 0;
              }
              .header-content {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                flex-shrink: 0;
                margin-bottom: 10px;
              }
              .header-content img {
                max-width: 150px;
                width: auto;
                height: auto;
                display: block;
              }
              .clinic-info {
                font-size: 11pt;
                color: #000000;
                text-align: left;
                flex: 1;
                min-width: 0;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .clinic-info p {
                margin: 2px 0;
                color: #000000;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              h2 {
                text-align: center;
                margin: 30px 0;
                font-size: 18pt;
                font-weight: 600;
                color: #000000;
                font-family: 'Fustat', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              }
              .patient-info {
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #cccccc;
                font-size: 11pt;
                color: #000000;
              }
              .patient-info p {
                margin: 2px 0;
                color: #000000;
              }
              .content {
                margin-top: 20px;
                text-align: justify;
                white-space: pre-wrap !important;
                color: #000000;
                font-family: 'Fustat', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              }
              .content p {
                margin-bottom: 8px;
                white-space: pre-wrap !important;
                display: block;
              }
              .content div {
                white-space: pre-wrap !important;
                display: block;
              }
              .content br {
                display: block !important;
                content: "" !important;
                margin-top: 8px !important;
                line-height: 1.6 !important;
                height: 1.6em !important;
              }
              .content * {
                white-space: pre-wrap !important;
              }
              .content strong, .content b {
                font-weight: bold;
              }
              .content em, .content i {
                font-style: italic;
              }
              .content u {
                text-decoration: underline;
              }
              .content h1, .content h2, .content h3 {
                font-weight: bold;
                margin: 12px 0;
                white-space: pre-wrap;
              }
              .content h1 {
                font-size: 18pt;
              }
              .content h2 {
                font-size: 16pt;
              }
              .content h3 {
                font-size: 14pt;
              }
              .content ul, .content ol {
                margin-left: 20px;
                margin-bottom: 8px;
              }
              .content li {
                margin-bottom: 4px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              ${clinicData ? `
                <div class="clinic-info">
                  <p style="font-weight: bold;">${clinicData.clinic_name}</p>
                  ${clinicData.clinic_phone ? `<p>Telefone: ${clinicData.clinic_phone}</p>` : ''}
                  ${clinicData.clinic_email ? `<p>E-mail: ${clinicData.clinic_email}</p>` : ''}
                </div>
              ` : '<div></div>'}
              <div class="header-content">
                <img src="https://i.ibb.co/JWXCwQmy/img-banner-pdf.jpg" alt="Dentioo Banner" style="width: 100%; max-width: 150px; height: auto;" />
              </div>
            </div>
            <h2>${title}</h2>
            ${patientName ? `
              <div class="patient-info">
                <p><strong>Paciente:</strong> ${patientName}</p>
                ${finalPatientPhone ? `<p><strong>Telefone:</strong> ${finalPatientPhone}</p>` : ''}
              </div>
            ` : ''}
            <div class="content">${cleanedContent}</div>
          </body>
        </html>
      `)
      iframeDoc.close()

      // Função para extrair todas as linhas do conteúdo HTML
      const extractLines = (html: string): string[] => {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html
        
        const lines: string[] = []
        
        // Função para processar nós e extrair linhas
        const processNode = (node: Node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || ''
            if (text.trim()) {
              // Dividir por quebras de linha
              const textLines = text.split(/\r?\n/)
              textLines.forEach(line => {
                const trimmed = line.trim()
                if (trimmed) {
                  lines.push(trimmed)
                }
              })
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement
            const tagName = element.tagName.toLowerCase()
            
            if (tagName === 'br') {
              lines.push('') // <br> cria uma linha vazia
            } else if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'].includes(tagName)) {
              // Elementos de bloco: extrair texto e processar <br> dentro
              const innerText = element.textContent || ''
              if (innerText.trim()) {
                const innerLines = innerText.split(/\r?\n/)
                innerLines.forEach(line => {
                  const trimmed = line.trim()
                  if (trimmed) {
                    lines.push(trimmed)
                  }
                })
              } else {
                lines.push('') // Elemento vazio conta como uma linha
              }
              
              // Processar <br> dentro do elemento
              const brTags = element.querySelectorAll('br')
              brTags.forEach(() => lines.push(''))
            } else {
              // Outros elementos: processar filhos
              Array.from(element.childNodes).forEach(processNode)
            }
          }
        }
        
        Array.from(tempDiv.childNodes).forEach(processNode)
        
        return lines.length > 0 ? lines : ['']
      }

      // Função para dividir conteúdo em chunks: primeira página 28 linhas, demais 33 linhas
      const splitContentByLines = (html: string): string[] => {
        // Extrair todas as linhas
        const allLines = extractLines(html)
        const totalLines = allLines.length
        
        // Se tem 28 linhas ou menos, retornar tudo
        if (totalLines <= 28) {
          return [html]
        }
        
        // Dividir em chunks
        const chunks: string[] = []
        const firstPageLines = 28
        const otherPagesLines = 33
        
        let startIndex = 0
        let isFirstPage = true
        
        while (startIndex < totalLines) {
          const maxLines = isFirstPage ? firstPageLines : otherPagesLines
          const endIndex = Math.min(startIndex + maxLines, totalLines)
          
          // Pegar linhas deste chunk
          const chunkLines = allLines.slice(startIndex, endIndex)
          
          // Converter linhas de volta para HTML
          const chunkHtml = chunkLines.map(line => {
            if (line === '') {
              return '<br>'
            } else {
              return `<p>${line}</p>`
            }
          }).join('')
          
          chunks.push(chunkHtml)
          
          startIndex = endIndex
          isFirstPage = false
        }
        
        return chunks.length > 0 ? chunks : [html]
      }

      // Extrair linhas e dividir conteúdo
      const allLines = extractLines(cleanedContent)
      const totalLines = allLines.length
      
      // Dividir conteúdo em páginas: primeira com 28 linhas, demais com 33 linhas
      const contentChunks = splitContentByLines(cleanedContent)
      const totalPages = contentChunks.length
      
      // Debug: mostrar quantas linhas e chunks foram criados (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        console.log(`Total de linhas: ${totalLines}, Total de páginas: ${totalPages}`)
        contentChunks.forEach((chunk, index) => {
          const chunkLines = extractLines(chunk).length
          console.log(`Página ${index + 1}: ${chunkLines} linhas`)
        })
      }

      // Configurações do PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = 210
      const pageHeight = 297
      const margin = 20
      const borderWidth = 1.6
      const spacingFromBorder = 3
      const contentWidth = pageWidth - margin - borderWidth - spacingFromBorder
      const availableHeight = pageHeight - margin * 2
      
      // Função para adicionar borda colorida
      const addColorBorder = (pdf: jsPDF) => {
        const segments = 50
        const segmentHeight = pageHeight / segments
        
        for (let i = 0; i < segments; i++) {
          const y = i * segmentHeight
          const progress = i / (segments - 1)
          let r, g, b
          
          if (progress < 0.5) {
            const localProgress = progress * 2
            r = Math.round(59 + (139 - 59) * localProgress)
            g = Math.round(130 + (92 - 130) * localProgress)
            b = Math.round(246 + (246 - 246) * localProgress)
          } else {
            const localProgress = (progress - 0.5) * 2
            r = Math.round(139 + (236 - 139) * localProgress)
            g = Math.round(92 + (72 - 92) * localProgress)
            b = Math.round(246 + (153 - 246) * localProgress)
          }
          
          pdf.setFillColor(r, g, b)
          pdf.rect(pageWidth - borderWidth, y, borderWidth, segmentHeight, 'F')
        }
      }

      // Renderizar cada página separadamente
      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
        if (pageNum > 0) {
          pdf.addPage()
        }
        
        // Obter o chunk de conteúdo para esta página
        const pageContent = contentChunks[pageNum] || cleanedContent
        
        // Criar um novo iframe para esta página
        const pageIframe = document.createElement('iframe')
        pageIframe.style.position = 'absolute'
        pageIframe.style.left = '-9999px'
        pageIframe.style.width = '800px'
        pageIframe.style.height = '1200px'
        pageIframe.style.border = 'none'
        pageIframe.style.margin = '0'
        pageIframe.style.padding = '0'
        document.body.appendChild(pageIframe)

        await new Promise(resolve => {
          pageIframe.onload = resolve
          pageIframe.src = 'about:blank'
        })

        const pageIframeDoc = pageIframe.contentDocument || pageIframe.contentWindow?.document
        if (!pageIframeDoc) {
          throw new Error('Não foi possível acessar o documento do iframe da página')
        }

        // Escrever HTML com o conteúdo desta página
        pageIframeDoc.open()
        pageIframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
              <link href="https://fonts.googleapis.com/css2?family=Fustat:wght@400;500;600;700&display=swap" rel="stylesheet">
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                html {
                  margin: 0;
                  padding: 0;
                  width: 100%;
                  height: 100%;
                  overflow: visible;
                }
                body {
                  margin: 0;
                  padding: 20px;
                  padding-right: 30px;
                  width: 800px;
                  font-family: 'Fustat', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                  font-size: 12pt;
                  line-height: 1.6;
                  color: #000000;
                  background-color: #ffffff;
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                }
                .header {
                  margin-bottom: 20px;
                  padding-bottom: 15px;
                  border-bottom: 2px solid #333333;
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  gap: 20px;
                }
                .header-content {
                  display: flex;
                  align-items: center;
                  justify-content: flex-end;
                  flex-shrink: 0;
                  margin-bottom: 10px;
                }
                .header-content img {
                  max-width: 150px;
                  width: auto;
                  height: auto;
                  display: block;
                }
                .clinic-info {
                  font-size: 11pt;
                  color: #000000;
                  text-align: left;
                  flex: 1;
                  min-width: 0;
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                }
                .clinic-info p {
                  margin: 2px 0;
                  color: #000000;
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                }
                h2 {
                  text-align: center;
                  margin: 30px 0;
                  font-size: 18pt;
                  font-weight: 600;
                  color: #000000;
                  font-family: 'Fustat', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                }
                .patient-info {
                  margin-bottom: 20px;
                  padding-bottom: 10px;
                  border-bottom: 1px solid #cccccc;
                  font-size: 11pt;
                  color: #000000;
                }
                .patient-info p {
                  margin: 2px 0;
                  color: #000000;
                }
                .content {
                  margin-top: 20px;
                  text-align: justify;
                  white-space: pre-wrap !important;
                  color: #000000;
                  font-family: 'Fustat', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                }
                .content p {
                  margin-bottom: 8px;
                  white-space: pre-wrap !important;
                  display: block;
                }
                .content div {
                  white-space: pre-wrap !important;
                  display: block;
                }
                .content br {
                  display: block !important;
                  content: "" !important;
                  margin-top: 8px !important;
                  line-height: 1.6 !important;
                  height: 1.6em !important;
                }
                .content * {
                  white-space: pre-wrap !important;
                }
                .content strong, .content b {
                  font-weight: bold;
                }
                .content em, .content i {
                  font-style: italic;
                }
                .content u {
                  text-decoration: underline;
                }
                .content h1, .content h2, .content h3 {
                  font-weight: bold;
                  margin: 12px 0;
                  white-space: pre-wrap;
                }
                .content h1 {
                  font-size: 18pt;
                }
                .content h2 {
                  font-size: 16pt;
                }
                .content h3 {
                  font-size: 14pt;
                }
                .content ul, .content ol {
                  margin-left: 20px;
                  margin-bottom: 8px;
                }
                .content li {
                  margin-bottom: 4px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                ${clinicData ? `
                  <div class="clinic-info">
                    <p style="font-weight: bold;">${clinicData.clinic_name}</p>
                    ${clinicData.clinic_phone ? `<p>Telefone: ${clinicData.clinic_phone}</p>` : ''}
                    ${clinicData.clinic_email ? `<p>E-mail: ${clinicData.clinic_email}</p>` : ''}
                  </div>
                ` : '<div></div>'}
                <div class="header-content">
                  <img src="https://i.ibb.co/JWXCwQmy/img-banner-pdf.jpg" alt="Dentioo Banner" style="width: 100%; max-width: 150px; height: auto;" />
                </div>
              </div>
              ${pageNum === 0 ? `
                <h2>${title}</h2>
                ${patientName ? `
                  <div class="patient-info">
                    <p><strong>Paciente:</strong> ${patientName}</p>
                    ${finalPatientPhone ? `<p><strong>Telefone:</strong> ${finalPatientPhone}</p>` : ''}
                  </div>
                ` : ''}
              ` : ''}
              <div class="content">${pageContent}</div>
            </body>
          </html>
        `)
        pageIframeDoc.close()

        // Aguardar renderização
        await new Promise(resolve => setTimeout(resolve, 500))

        // Capturar esta página
        const pageCanvas = await html2canvas(pageIframeDoc.body, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 800,
          windowWidth: 800,
          onclone: (clonedDoc) => {
            const clonedStyle = clonedDoc.createElement('style')
            clonedStyle.textContent = `
              .content {
                white-space: pre-wrap !important;
              }
              .content * {
                white-space: pre-wrap !important;
              }
              .content br {
                display: block !important;
                content: "" !important;
                margin-top: 8px !important;
                line-height: 1.6 !important;
              }
            `
            clonedDoc.head.appendChild(clonedStyle)
          }
        })

        // Calcular dimensões para o PDF
        const mmPerPx = contentWidth / 800
        const pageHeightMm = Math.min((pageCanvas.height / 2) * mmPerPx, availableHeight)
        
        // Adicionar ao PDF
        const pageImgData = pageCanvas.toDataURL('image/png')
        
        pdf.addImage(
          pageImgData,
          'PNG',
          margin,
          margin,
          contentWidth,
          pageHeightMm
        )
        addColorBorder(pdf)

        // Remover iframe da página
        document.body.removeChild(pageIframe)
      }

      // Remover iframe original
      document.body.removeChild(iframe)

      const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
      pdf.save(fileName)
      } catch (error) {
        alert('Erro ao exportar PDF. Tente novamente.')
    }
  }

  // Função auxiliar para converter HTML em TextRuns formatados
  const parseHTMLToTextRuns = (html: string): TextRun[] => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    
    const textRuns: TextRun[] = []
    
    const processNode = (node: Node, inheritedStyle: { bold?: boolean; italic?: boolean; underline?: boolean; color?: string } = {}): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent
        if (text && text.trim()) {
          const runOptions: any = { text: text.trim() }
          
          if (inheritedStyle.bold) runOptions.bold = true
          if (inheritedStyle.italic) runOptions.italics = true
          if (inheritedStyle.underline) runOptions.underline = {}
          if (inheritedStyle.color) runOptions.color = inheritedStyle.color
          
          textRuns.push(new TextRun(runOptions))
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        const tagName = el.tagName.toLowerCase()
        const style = window.getComputedStyle(el)
        
        const currentStyle = { ...inheritedStyle }
        
        // Aplicar formatação baseada na tag e estilos
        if (tagName === 'strong' || tagName === 'b' || style.fontWeight === 'bold' || parseInt(style.fontWeight || '0') >= 600) {
          currentStyle.bold = true
        }
        if (tagName === 'em' || tagName === 'i' || style.fontStyle === 'italic') {
          currentStyle.italic = true
        }
        if (tagName === 'u' || style.textDecoration?.includes('underline')) {
          currentStyle.underline = true
        }
        if (style.color && style.color !== 'rgb(0, 0, 0)' && style.color !== 'black') {
          // Converter cor RGB para hex
          const rgbMatch = style.color.match(/\d+/g)
          if (rgbMatch && rgbMatch.length === 3) {
            const hex = '#' + rgbMatch.map(x => {
              const hex = parseInt(x).toString(16)
              return hex.length === 1 ? '0' + hex : hex
            }).join('')
            currentStyle.color = hex
          }
        }
        
        // Processar filhos recursivamente
        Array.from(el.childNodes).forEach(child => {
          processNode(child, currentStyle)
        })
      }
    }
    
    Array.from(tempDiv.childNodes).forEach(child => {
      processNode(child)
    })
    
    return textRuns.length > 0 ? textRuns : [new TextRun('')]
  }

  // Exportar para DOCX
  const handleExportDOCX = async (record?: PatientRecord) => {
    const title = record?.title || recordTitle
    const content = record?.content || editorRef.current?.innerHTML || ""
    const patientName = record?.patient_name || selectedPatient?.full_name || ""
    const patientPhone = selectedPatient?.phone || ""

    if (!title || !content) {
      alert("Salve o prontuário antes de exportar")
      return
    }

    try {
      const paragraphs: Paragraph[] = []

      // Header - Dentioo
      paragraphs.push(
        new Paragraph({
          text: "Dentioo",
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        })
      )

      // Informações da Clínica
      if (clinicData) {
        paragraphs.push(
          new Paragraph({
            text: clinicData.clinic_name,
            spacing: { after: 100 },
          })
        )
        
        if (clinicData.clinic_phone) {
          paragraphs.push(
            new Paragraph({
              text: `Telefone: ${clinicData.clinic_phone}`,
              spacing: { after: 100 },
            })
          )
        }
        
        if (clinicData.clinic_email) {
          paragraphs.push(
            new Paragraph({
              text: `E-mail: ${clinicData.clinic_email}`,
              spacing: { after: 400 },
            })
          )
        }
      }

      // Título do Prontuário
      paragraphs.push(
        new Paragraph({
          text: title,
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      )

      // Informações do Paciente
      if (patientName) {
        paragraphs.push(
          new Paragraph({
            text: `Paciente: ${patientName}`,
            spacing: { after: 100 },
          })
        )
        if (patientPhone) {
          paragraphs.push(
            new Paragraph({
              text: `Telefone: ${patientPhone}`,
              spacing: { after: 400 },
            })
          )
        }
      }

      // Converter HTML para parágrafos formatados
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      
      // Processar cada elemento de bloco
      const processElement = (element: HTMLElement): void => {
        const tagName = element.tagName.toLowerCase()
        
        if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
          const textRuns = parseHTMLToTextRuns(element.innerHTML)
          if (textRuns.length > 0) {
            paragraphs.push(
              new Paragraph({
                children: textRuns,
                spacing: { after: 100 },
              })
            )
          }
        } else if (tagName === 'br') {
          paragraphs.push(
            new Paragraph({
              text: '',
              spacing: { after: 100 },
            })
          )
        } else if (tagName === 'li') {
          const textRuns = parseHTMLToTextRuns(element.innerHTML)
          if (textRuns.length > 0) {
            paragraphs.push(
              new Paragraph({
                children: textRuns,
                spacing: { after: 100 },
              })
            )
          }
        }
      }
      
      // Processar todos os elementos
      Array.from(tempDiv.children).forEach(child => {
        processElement(child as HTMLElement)
      })
      
      // Se não houver elementos filhos, processar o conteúdo diretamente
      if (tempDiv.children.length === 0) {
        const textRuns = parseHTMLToTextRuns(content)
        if (textRuns.length > 0) {
          paragraphs.push(
            new Paragraph({
              children: textRuns,
              spacing: { after: 100 },
            })
          )
        }
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs,
        }],
      })

      const blob = await Packer.toBlob(doc)
      const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`
      saveAs(blob, fileName)
    } catch (error) {
      alert('Erro ao exportar DOCX')
    }
  }

  // Imprimir
  const handlePrint = (record?: PatientRecord) => {
    const title = record?.title || recordTitle
    const content = record?.content || editorRef.current?.innerHTML || ""
    const patientName = record?.patient_name || selectedPatient?.full_name || ""
    const patientPhone = selectedPatient?.phone || ""

    if (!title || !content) {
      alert("Salve o prontuário antes de imprimir")
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const clinicInfo = clinicData ? `
      <div style="margin-bottom: 20px;">
        <p style="font-weight: bold; margin-bottom: 5px;">${clinicData.clinic_name}</p>
        ${clinicData.clinic_phone ? `<p style="margin: 2px 0;">Telefone: ${clinicData.clinic_phone}</p>` : ''}
        ${clinicData.clinic_email ? `<p style="margin: 2px 0;">E-mail: ${clinicData.clinic_email}</p>` : ''}
      </div>
    ` : ''

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              @page { margin: 2cm; }
            }
            body {
              font-family: 'Times New Roman', serif;
              line-height: 1.6;
              color: #000;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: flex-end;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #333;
            }
            .header img {
              width: 100%;
              max-width: 150px;
              height: auto;
              object-fit: contain;
            }
            .clinic-info {
              margin-bottom: 20px;
              font-size: 11pt;
            }
            h2 { 
              text-align: center; 
              margin: 30px 0; 
              font-size: 18pt;
              font-weight: bold;
            }
            .patient-info { 
              margin-bottom: 20px; 
              padding-bottom: 10px; 
              border-bottom: 1px solid #ccc;
              font-size: 11pt;
            }
            .content { 
              margin-top: 20px; 
              text-align: justify;
              font-size: 12pt;
            }
            .content p { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="https://i.ibb.co/JWXCwQmy/img-banner-pdf.jpg" alt="Dentioo Banner" style="width: 100%; max-width: 150px; height: auto;" />
          </div>
          ${clinicInfo}
          <h2>${title}</h2>
          ${patientName ? `
            <div class="patient-info">
              <p><strong>Paciente:</strong> ${patientName}</p>
              ${patientPhone ? `<p><strong>Telefone:</strong> ${patientPhone}</p>` : ''}
            </div>
          ` : ''}
          <div class="content">${content}</div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const filteredRecords = records.filter(record => {
    const searchLower = searchTerm.toLowerCase()
    return (
      record.title?.toLowerCase().includes(searchLower) ||
      record.content?.toLowerCase().includes(searchLower) ||
      record.patient_name?.toLowerCase().includes(searchLower)
    )
  })

  // Filtrar pacientes para busca
  const filteredPatients = patientSearchQuery.trim()
    ? patients.filter(patient =>
        patient.full_name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
        patient.phone?.toLowerCase().includes(patientSearchQuery.toLowerCase())
      )
    : patients.slice(0, 10) // Mostrar primeiros 10 se não houver busca

  const selectedPatient = patients.find(p => p.id === selectedPatientId)

  const stats = {
    total: records.length,
    recent: records.filter(r => {
      const date = new Date(r.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return date >= weekAgo
    }).length,
    withContent: records.filter(r => r.content && r.content.trim().length > 0).length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Prontuários 📋</h1>
            <p className="text-lg text-gray-600">Gerencie prontuários digitais dos seus pacientes</p>
          </div>
          <button
            onClick={() => {
              setEditingRecord(null)
              setRecordTitle("")
              setSelectedPatientId("")
              if (editorRef.current) {
                editorRef.current.innerHTML = ""
              }
              setShowEditor(true)
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Novo Prontuário
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900/70">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900/70">Recentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recent}</p>
              </div>
              <Clock className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900/70">Com Conteúdo</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withContent}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4 overflow-x-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'cards'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Grid3x3 size={18} />
            Cards
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'list'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <List size={18} />
            Lista
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'stats'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <BarChart3 size={18} />
            Estatísticas
          </button>
        </div>
      </div>

      {/* Search */}
      {viewMode !== 'stats' && (
        <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por título, conteúdo ou paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Content */}
      {viewMode === 'cards' && (
        <div className="animate-in fade-in duration-300">
          {filteredRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecords.map((record, index) => (
                <div
                  key={record.id}
                  className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{record.title || "Sem título"}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <User size={14} />
                        {record.patient_name || "Paciente não encontrado"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div 
                      className="text-sm text-gray-600 line-clamp-3"
                      dangerouslySetInnerHTML={{ 
                        __html: record.content?.substring(0, 150) || "Sem conteúdo..." 
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Calendar size={14} />
                    {new Date(record.created_at).toLocaleDateString('pt-BR')}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(record)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleExportPDF(record)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                        title="Exportar PDF"
                      >
                        <FileDown size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setRecordToDelete(record)
                        setShowDeleteModal(true)
                      }}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-700 font-semibold text-lg mb-2">Nenhum prontuário encontrado</p>
              <p className="text-gray-500 mb-6">
                {searchTerm ? 'Tente ajustar sua busca' : 'Comece criando seu primeiro prontuário'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowEditor(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <Plus size={20} />
                  Criar Primeiro Prontuário
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Título</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Paciente</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Criado em</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-900">{record.title || "Sem título"}</span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          {record.patient_name || "Paciente não encontrado"}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(record.created_at).toLocaleDateString("pt-BR")}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="text-blue-600 hover:text-blue-700 transition font-medium text-sm flex items-center gap-1"
                          >
                            <Edit size={16} />
                            Editar
                          </button>
                          <button
                            onClick={() => handleExportPDF(record)}
                            className="text-red-600 hover:text-red-700 transition font-medium text-sm"
                            title="Exportar PDF"
                          >
                            <FileDown size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setRecordToDelete(record)
                              setShowDeleteModal(true)
                            }}
                            className="text-red-600 hover:text-red-700 transition font-medium text-sm flex items-center gap-1"
                          >
                            <Trash2 size={16} />
                            Deletar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'stats' && (
        <div className="animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Visão Geral</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <span className="font-medium text-gray-700">Total de Prontuários</span>
                  <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <span className="font-medium text-gray-700">Criados na Última Semana</span>
                  <span className="text-2xl font-bold text-green-600">{stats.recent}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                  <span className="font-medium text-gray-700">Com Conteúdo</span>
                  <span className="text-2xl font-bold text-purple-600">{stats.withContent}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
              <div className="space-y-3">
                {records.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{record.title || "Sem título"}</p>
                      <p className="text-sm text-gray-500">{new Date(record.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingRecord ? 'Editar Prontuário' : 'Novo Prontuário'}
              </h2>
              <button
                onClick={() => {
                  setShowEditor(false)
                  setEditingRecord(null)
                  setRecordTitle("")
                  setSelectedPatientId("")
                  setPatientSearchQuery("")
                  setShowPatientDropdown(false)
                  if (editorRef.current) {
                    editorRef.current.innerHTML = ""
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Formulário */}
                <div className="space-y-4">
                  {/* Patient Selection */}
                <div ref={patientSearchRef} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paciente *
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={selectedPatient ? selectedPatient.full_name : patientSearchQuery}
                      onChange={(e) => {
                        setPatientSearchQuery(e.target.value)
                        setShowPatientDropdown(true)
                        if (!e.target.value) {
                          setSelectedPatientId("")
                        }
                      }}
                      onFocus={() => setShowPatientDropdown(true)}
                      placeholder="Buscar paciente..."
                      className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!!editingRecord}
                    />
                    {selectedPatientId && !editingRecord && (
                      <button
                        onClick={() => {
                          setSelectedPatientId("")
                          setPatientSearchQuery("")
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X size={16} className="text-gray-400" />
                      </button>
                    )}
                    {!selectedPatientId && (
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    )}
                  </div>

                  {/* Dropdown de pacientes */}
                  {showPatientDropdown && !editingRecord && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <button
                            key={patient.id}
                            onClick={() => {
                              setSelectedPatientId(patient.id)
                              setPatientSearchQuery("")
                              setShowPatientDropdown(false)
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                  {patient.full_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{patient.full_name}</p>
                                  {patient.phone && (
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                      <Phone size={12} />
                                      {patient.phone}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <p className="text-gray-500 text-sm">Nenhum paciente encontrado</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={recordTitle}
                    onChange={(e) => setRecordTitle(e.target.value)}
                    placeholder="Ex: Consulta de rotina - 15/12/2024"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Toolbar - Estilo Word */}
                <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                  {/* Primeira linha - Formatação de texto */}
                  <div className="flex flex-wrap gap-2 mb-2 pb-2 border-b border-gray-200">
                    <button
                      onClick={() => formatToolbar('bold')}
                      className="px-3 py-2 hover:bg-gray-200 rounded-lg font-bold text-sm"
                      title="Negrito (Ctrl+B)"
                    >
                      B
                    </button>
                    <button
                      onClick={() => formatToolbar('italic')}
                      className="px-3 py-2 hover:bg-gray-200 rounded-lg italic text-sm"
                      title="Itálico (Ctrl+I)"
                    >
                      I
                    </button>
                    <button
                      onClick={() => formatToolbar('underline')}
                      className="px-3 py-2 hover:bg-gray-200 rounded-lg underline text-sm"
                      title="Sublinhado (Ctrl+U)"
                    >
                      U
                    </button>
                    <div className="w-px bg-gray-300 mx-1"></div>
                    <select
                      onChange={(e) => formatToolbar('fontSize', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm hover:bg-gray-50"
                      title="Tamanho da fonte"
                    >
                      <option value="">Tamanho</option>
                      <option value="1">8pt</option>
                      <option value="2">10pt</option>
                      <option value="3">12pt</option>
                      <option value="4">14pt</option>
                      <option value="5">18pt</option>
                      <option value="6">24pt</option>
                      <option value="7">36pt</option>
                    </select>
                    <input
                      type="color"
                      onChange={(e) => formatToolbar('foreColor', e.target.value)}
                      className="w-10 h-9 border border-gray-300 rounded-lg cursor-pointer"
                      title="Cor do texto"
                    />
                    <div className="w-px bg-gray-300 mx-1"></div>
                    <button
                      onClick={() => formatToolbar('formatBlock', 'h1')}
                      className="px-3 py-2 hover:bg-gray-200 rounded-lg text-sm font-semibold"
                      title="Título 1"
                    >
                      T1
                    </button>
                    <button
                      onClick={() => formatToolbar('formatBlock', 'h2')}
                      className="px-3 py-2 hover:bg-gray-200 rounded-lg text-sm font-semibold"
                      title="Título 2"
                    >
                      T2
                    </button>
                    <button
                      onClick={() => formatToolbar('formatBlock', 'h3')}
                      className="px-3 py-2 hover:bg-gray-200 rounded-lg text-sm font-semibold"
                      title="Título 3"
                    >
                      T3
                    </button>
                  </div>

                  {/* Segunda linha - Alinhamento e listas */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => formatToolbar('justifyLeft')}
                      className="px-3 py-2 hover:bg-gray-200 rounded-lg"
                      title="Alinhar à esquerda"
                    >
                      <AlignLeft size={16} />
                    </button>
                    <button
                      onClick={() => formatToolbar('justifyCenter')}
                      className="px-3 py-2 hover:bg-gray-200 rounded-lg"
                      title="Centralizar"
                    >
                      <AlignCenter size={16} />
                    </button>
                    <button
                      onClick={() => formatToolbar('justifyRight')}
                      className="px-3 py-2 hover:bg-gray-200 rounded-lg"
                      title="Alinhar à direita"
                    >
                      <AlignRight size={16} />
                    </button>
                    <button
                      onClick={() => formatToolbar('justifyFull')}
                      className="px-3 py-2 hover:bg-gray-200 rounded-lg"
                      title="Justificar"
                    >
                      <AlignJustify size={16} />
                    </button>
                    <div className="w-px bg-gray-300 mx-1"></div>
                    <button
                      onClick={() => formatToolbar('insertUnorderedList')}
                      className="px-3 py-2 hover:bg-gray-200 rounded-lg"
                      title="Lista com marcadores"
                    >
                      •
                    </button>
                    <button
                      onClick={() => formatToolbar('insertOrderedList')}
                      className="px-3 py-2 hover:bg-gray-200 rounded-lg"
                      title="Lista numerada"
                    >
                      1.
                    </button>
                    <div className="w-px bg-gray-300 mx-1"></div>
                    <button
                      onClick={() => formatToolbar('removeFormat')}
                      className="px-3 py-2 hover:bg-gray-200 rounded-lg text-sm"
                      title="Remover formatação"
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                {/* Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conteúdo
                  </label>
                  <div
                    ref={editorRef}
                    contentEditable
                    className="w-full min-h-[400px] px-6 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white editor-placeholder"
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      fontFamily: 'Times New Roman, serif',
                      fontSize: '12pt',
                      lineHeight: '1.6',
                    }}
                    data-placeholder="Digite o conteúdo do prontuário aqui..."
                  />
                  <style dangerouslySetInnerHTML={{__html: `
                    .editor-placeholder:empty:before {
                      content: attr(data-placeholder);
                      color: #9ca3af;
                      pointer-events: none;
                    }
                  `}} />
                </div>
                </div>

                {/* Pré-visualização */}
                <div className="lg:border-l lg:border-gray-200 lg:pl-6">
                  <div className="sticky top-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pré-visualização</h3>
                    <div className="space-y-4">
                      {(previewPages.length > 0 ? previewPages : [1]).map((pageNum) => (
                        <div 
                          key={pageNum}
                          className="bg-white border-2 border-gray-200 rounded-xl shadow-lg p-6 relative"
                          style={{ 
                            minHeight: '1123px',
                            maxWidth: '794px',
                            margin: '0 auto',
                            pageBreakAfter: pageNum < previewPages.length ? 'always' : 'auto',
                          }}
                        >
                          {/* Indicador de Página */}
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-100 px-4 py-1 rounded-full text-xs font-semibold text-gray-600 z-20">
                            Página {pageNum}
                          </div>
                          
                          {/* Borda colorida na quina */}
                          <div 
                            className="absolute top-0 right-0 w-1.5 rounded-r-xl"
                            style={{
                              background: 'linear-gradient(to bottom, #3b82f6, #8b5cf6, #ec4899)',
                              height: '100%',
                              zIndex: 10,
                            }}
                          />
                          
                          {/* Template do Documento */}
                          <div 
                            ref={pageNum === 1 ? previewPagesRef : null}
                            className="document-preview relative"
                            style={{
                              fontFamily: "'Fustat', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
                              fontSize: '12pt',
                              lineHeight: '1.6',
                              color: '#000',
                              paddingTop: '40px',
                            }}
                          >
                            {/* Header com Logo e Informações - apenas na primeira página */}
                            {pageNum === 1 && (
                              <>
                                <div className="mb-8 pb-6 border-b-2 border-gray-300">
                                  <div className="flex justify-between items-start gap-4">
                                    {clinicData && (
                                      <div className="text-sm text-gray-700 space-y-1 flex-1 min-w-0" style={{ fontFamily: "'Fustat', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif" }}>
                                        <p className="font-semibold break-words">{clinicData.clinic_name}</p>
                                        {clinicData.clinic_phone && <p className="break-words">Telefone: {clinicData.clinic_phone}</p>}
                                        {clinicData.clinic_email && <p className="break-words">E-mail: {clinicData.clinic_email}</p>}
                                      </div>
                                    )}
                                    {!clinicData && <div className="flex-1"></div>}
                                    <div className="flex items-center justify-end flex-shrink-0">
                                      <img 
                                        src="https://i.ibb.co/JWXCwQmy/img-banner-pdf.jpg" 
                                        alt="Dentioo Banner" 
                                        className="max-w-[150px] h-auto object-contain"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Título do Prontuário */}
                                {recordTitle && (
                                  <h2 className="text-xl font-bold text-center mb-6" style={{ fontFamily: "'Fustat', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif" }}>
                                    {recordTitle}
                                  </h2>
                                )}

                                {/* Informações do Paciente */}
                                {selectedPatient && (
                                  <div className="mb-6 pb-4 border-b border-gray-200">
                                    <p className="text-sm">
                                      <strong>Paciente:</strong> {selectedPatient.full_name}
                                    </p>
                                    {selectedPatient.phone && (
                                      <p className="text-sm">
                                        <strong>Telefone:</strong> {selectedPatient.phone}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </>
                            )}

                            {/* Conteúdo do Prontuário */}
                            <div 
                              className="preview-container"
                              style={{
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                maxWidth: '100%',
                              }}
                            >
                              <style dangerouslySetInnerHTML={{__html: `
                                .preview-content {
                                  white-space: pre-wrap !important;
                                }
                                .preview-content p {
                                  white-space: pre-wrap !important;
                                  margin-bottom: 8px;
                                }
                                .preview-content div {
                                  white-space: pre-wrap !important;
                                }
                                .preview-content br {
                                  display: block;
                                  content: "";
                                  margin-top: 8px;
                                }
                              `}} />
                              <div 
                                className="preview-content prose prose-sm max-w-none"
                                style={{
                                  fontFamily: "'Fustat', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
                                  fontSize: '12pt',
                                  lineHeight: '1.6',
                                  wordWrap: 'break-word',
                                  overflowWrap: 'break-word',
                                  maxWidth: '100%',
                                  whiteSpace: 'pre-wrap',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              {/* Botões de exportação - apenas quando há conteúdo salvo */}
              {editingRecord && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportPDF(editingRecord)}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                    title="Exportar como PDF"
                  >
                    <FileDown size={16} />
                    PDF
                  </button>
                </div>
              )}
              {!editingRecord && <div></div>}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowEditor(false)
                    setEditingRecord(null)
                    setRecordTitle("")
                    setSelectedPatientId("")
                    setPatientSearchQuery("")
                    setShowPatientDropdown(false)
                    if (editorRef.current) {
                      editorRef.current.innerHTML = ""
                    }
                  }}
                  className="px-6 py-2 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Salvar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setRecordToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Deletar Prontuário"
        message="Tem certeza que deseja deletar este prontuário? Esta ação não pode ser desfeita."
      />
    </div>
  )
}

