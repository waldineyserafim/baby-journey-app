import { useState, useRef } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FolderOpen, Plus, Trash2, X, Upload, FileText, Image, Download, Eye } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDocuments } from '../hooks/useDocuments'
import { DOCUMENT_CATEGORIES, getDocumentUrl, type Document } from '../services/documentService'

const uploadSchema = z.object({
  document_name: z.string().min(1, 'Nome obrigatório'),
  category: z.string().min(1, 'Categoria obrigatória'),
  notes: z.string().optional(),
})
type UploadValues = z.infer<typeof uploadSchema>

function FileTypeIcon({ fileType, size = 20 }: { fileType: string; size?: number }) {
  return fileType === 'pdf'
    ? <FileText size={size} style={{ color: '#ef4444' }} />
    : <Image size={size} style={{ color: '#3b82f6' }} />
}

function UploadModal({
  onClose,
  onUpload,
  loading,
}: {
  onClose: () => void
  onUpload: (file: File, values: UploadValues) => Promise<void>
  loading: boolean
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<UploadValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { document_name: '', category: '', notes: '' },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    // Auto-fill name from filename (without extension)
    const nameWithoutExt = f.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ')
    setValue('document_name', nameWithoutExt)
    // Preview only for images
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  async function onSubmit(values: UploadValues) {
    if (!file) return
    await onUpload(file, values)
  }

  const fileSizeMB = file ? (file.size / 1024 / 1024).toFixed(1) : null

  return (
    <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Adicionar Documento</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body">
              {/* File picker */}
              <div
                className="d-flex flex-column align-items-center justify-content-center rounded mb-4"
                style={{
                  border: '2px dashed #e2e8f0',
                  minHeight: 120,
                  background: '#f8fafc',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                }}
                onClick={() => inputRef.current?.click()}
              >
                {file ? (
                  <>
                    {preview ? (
                      <img
                        src={preview}
                        alt="preview"
                        style={{ maxHeight: 160, maxWidth: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div className="d-flex flex-column align-items-center gap-1 py-3">
                        <FileText size={32} style={{ color: '#ef4444' }} />
                        <span className="fw-semibold small">{file.name}</span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>{fileSizeMB} MB</span>
                      </div>
                    )}
                    <button
                      type="button"
                      className="btn btn-sm btn-light position-absolute top-0 end-0 m-1"
                      onClick={e => { e.stopPropagation(); setFile(null); setPreview(null) }}
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload size={28} className="mb-2 text-muted" />
                    <span className="text-muted small">Clique para selecionar um arquivo</span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>PDF, JPG, PNG, WebP • máx 20MB</span>
                  </>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="d-none"
                  onChange={handleFileChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Nome do documento *</label>
                <input
                  {...register('document_name')}
                  className={`form-control ${errors.document_name ? 'is-invalid' : ''}`}
                  placeholder="Ex: Resultado Hemograma Completo"
                />
                {errors.document_name && <div className="invalid-feedback">{errors.document_name.message}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Categoria *</label>
                <select {...register('category')} className={`form-select ${errors.category ? 'is-invalid' : ''}`}>
                  <option value="">Selecione...</option>
                  {DOCUMENT_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                  ))}
                </select>
                {errors.category && <div className="invalid-feedback">{errors.category.message}</div>}
              </div>

              <div>
                <label className="form-label fw-semibold small">Observações</label>
                <input
                  {...register('notes')}
                  className="form-control"
                  placeholder="Ex: Resultado do 2º trimestre..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading || !file}>
                {loading
                  ? <span className="spinner-border spinner-border-sm me-2" />
                  : <Upload size={14} className="me-2" />
                }
                Enviar documento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function DocumentCard({
  doc,
  onDelete,
}: {
  doc: Document
  onDelete: () => void
}) {
  const catConfig = DOCUMENT_CATEGORIES.find(c => c.value === doc.category)
  const url = getDocumentUrl(doc.storage_path)

  return (
    <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center gap-3">
      <div
        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
        style={{ width: 48, height: 48, background: doc.file_type === 'pdf' ? '#fef2f2' : '#eff6ff' }}
      >
        <FileTypeIcon fileType={doc.file_type} size={22} />
      </div>

      <div className="flex-grow-1 overflow-hidden">
        <div className="fw-semibold text-truncate" style={{ fontSize: '0.9rem' }}>
          {doc.document_name}
        </div>
        <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
          {catConfig && (
            <span
              className="badge"
              style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.65rem' }}
            >
              {catConfig.emoji} {catConfig.label}
            </span>
          )}
          <span className="text-muted" style={{ fontSize: '0.72rem' }}>
            {format(parseISO(doc.created_at!), "dd/MM/yyyy", { locale: ptBR })}
          </span>
          <span
            className="badge"
            style={{
              background: doc.file_type === 'pdf' ? '#fef2f2' : '#eff6ff',
              color: doc.file_type === 'pdf' ? '#ef4444' : '#3b82f6',
              fontSize: '0.6rem',
              textTransform: 'uppercase',
            }}
          >
            {doc.file_type}
          </span>
        </div>
        {doc.notes && (
          <div className="text-muted small mt-1 text-truncate fst-italic">{doc.notes}</div>
        )}
      </div>

      <div className="d-flex gap-1 flex-shrink-0">
        {doc.file_type === 'image' ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-light p-1"
            title="Visualizar"
          >
            <Eye size={14} />
          </a>
        ) : (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-light p-1"
            title="Abrir PDF"
          >
            <Download size={14} />
          </a>
        )}
        <button
          className="btn btn-sm btn-light p-1 text-danger"
          onClick={onDelete}
          title="Remover"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export function DocumentsPage() {
  const { data: documents, isLoading, upload, remove } = useDocuments()
  const [showUpload, setShowUpload] = useState(false)
  const [activeCategory, setActiveCategory] = useState('__all')

  const filtered = activeCategory === '__all'
    ? documents
    : documents.filter(d => d.category === activeCategory)

  async function handleUpload(file: File, values: UploadValues) {
    await upload.mutateAsync({
      file,
      document_name: values.document_name,
      category: values.category,
      notes: values.notes || null,
    })
    setShowUpload(false)
  }

  async function handleDelete(doc: Document) {
    if (!confirm(`Remover "${doc.document_name}" permanentemente?`)) return
    await remove.mutateAsync({ id: doc.id, storagePath: doc.storage_path })
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" style={{ color: '#7c3aed' }} />
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <FolderOpen size={20} style={{ color: '#7c3aed' }} />
            Documentos
          </h4>
          <p className="text-muted small mb-0">{documents.length} documento(s)</p>
        </div>
        <button
          className="btn btn-primary btn-sm d-flex align-items-center gap-2"
          onClick={() => setShowUpload(true)}
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>

      {/* Stats row */}
      {documents.length > 0 && (
        <div className="row g-2 mb-4">
          {DOCUMENT_CATEGORIES.map(cat => {
            const count = documents.filter(d => d.category === cat.value).length
            return (
              <div key={cat.value} className="col-6 col-md-3">
                <div
                  className="card border-0 p-3 text-center"
                  style={{ background: '#f8fafc', cursor: 'pointer' }}
                  onClick={() => setActiveCategory(count > 0 ? cat.value : '__all')}
                >
                  <div style={{ fontSize: '1.4rem' }}>{cat.emoji}</div>
                  <div className="fw-bold" style={{ color: '#7c3aed' }}>{count}</div>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>{cat.label}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Category tabs */}
      {documents.length > 0 && (
        <ul className="nav nav-pills mb-4 gap-1 flex-wrap">
          <li className="nav-item">
            <button
              className={`nav-link btn btn-sm ${activeCategory === '__all' ? 'active' : 'text-secondary'}`}
              onClick={() => setActiveCategory('__all')}
              style={{ fontSize: '0.8rem' }}
            >
              Todos ({documents.length})
            </button>
          </li>
          {DOCUMENT_CATEGORIES.map(cat => {
            const count = documents.filter(d => d.category === cat.value).length
            if (count === 0) return null
            return (
              <li key={cat.value} className="nav-item">
                <button
                  className={`nav-link btn btn-sm ${activeCategory === cat.value ? 'active' : 'text-secondary'}`}
                  onClick={() => setActiveCategory(cat.value)}
                  style={{ fontSize: '0.8rem' }}
                >
                  {cat.emoji} {cat.label} ({count})
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {documents.length === 0 && (
        <div className="card border-0 shadow-sm p-5 text-center text-muted">
          <FolderOpen size={40} className="mx-auto mb-3 opacity-50" />
          <p className="fw-semibold mb-1">Nenhum documento ainda</p>
          <p className="small mb-3">
            Guarde exames, laudos, documentos do bebê e da família em um só lugar.
          </p>
          <button
            className="btn btn-primary btn-sm mx-auto"
            style={{ width: 'fit-content' }}
            onClick={() => setShowUpload(true)}
          >
            <Plus size={14} className="me-1" />
            Primeiro documento
          </button>
        </div>
      )}

      <div className="d-flex flex-column gap-2">
        {filtered.map(doc => (
          <DocumentCard
            key={doc.id}
            doc={doc}
            onDelete={() => handleDelete(doc)}
          />
        ))}
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUpload={handleUpload}
          loading={upload.isPending}
        />
      )}
    </div>
  )
}
