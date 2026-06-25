import { useState, useRef } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Camera, Plus, Trash2, X, Upload } from 'lucide-react'
import { type Resolver, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePhotos } from '../hooks/usePhotos'
import { PHOTO_CATEGORIES, getPhotoUrl } from '../services/photoService'
import type { Photo } from '../services/photoService'

const uploadSchema = z.object({
  photo_date: z.string().min(1, 'Data obrigatória'),
  category: z.string().min(1, 'Categoria obrigatória'),
  caption: z.string().optional(),
  week_number: z.union([z.literal(''), z.coerce.number().int().min(1).max(42)]).optional(),
})
type UploadValues = z.infer<typeof uploadSchema>

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

  const { register, handleSubmit, formState: { errors } } = useForm<UploadValues>({
    resolver: zodResolver(uploadSchema) as unknown as Resolver<UploadValues>,
    defaultValues: {
      photo_date: format(new Date(), 'yyyy-MM-dd'),
      category: '',
      caption: '',
      week_number: '',
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  async function onSubmit(values: UploadValues) {
    if (!file) return
    await onUpload(file, values)
  }

  return (
    <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Adicionar Foto</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body">
              {/* File picker */}
              <div
                className="d-flex flex-column align-items-center justify-content-center rounded mb-4"
                style={{
                  border: '2px dashed #e2e8f0',
                  minHeight: 160,
                  background: '#f8fafc',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                }}
                onClick={() => inputRef.current?.click()}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="preview" style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain' }} />
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
                    <span className="text-muted small">Clique para selecionar uma foto</span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>JPG, PNG, WebP</span>
                  </>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={handleFileChange}
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-7">
                  <label className="form-label fw-semibold small">Data *</label>
                  <input
                    {...register('photo_date')}
                    type="date"
                    className={`form-control ${errors.photo_date ? 'is-invalid' : ''}`}
                  />
                  {errors.photo_date && <div className="invalid-feedback">{errors.photo_date.message}</div>}
                </div>
                <div className="col-5">
                  <label className="form-label fw-semibold small">Semana</label>
                  <input {...register('week_number')} type="number" min={1} max={42} className="form-control" placeholder="Ex: 20" />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Categoria *</label>
                <select {...register('category')} className={`form-select ${errors.category ? 'is-invalid' : ''}`}>
                  <option value="">Selecione...</option>
                  {PHOTO_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                  ))}
                </select>
                {errors.category && <div className="invalid-feedback">{errors.category.message}</div>}
              </div>

              <div>
                <label className="form-label fw-semibold small">Legenda</label>
                <input {...register('caption')} className="form-control" placeholder="Descreva este momento..." />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading || !file}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <Upload size={14} className="me-2" />}
                Enviar foto
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function LightboxModal({ photo, onClose, onDelete }: { photo: Photo; onClose: () => void; onDelete: () => void }) {
  const catConfig = PHOTO_CATEGORIES.find(c => c.value === photo.category)

  return (
    <div
      className="modal d-block"
      tabIndex={-1}
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down modal-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-content border-0" style={{ background: 'transparent' }}>
          <div className="d-flex justify-content-between align-items-center p-2">
            <div className="text-white small">
              {catConfig && <span className="me-2">{catConfig.emoji} {catConfig.label}</span>}
              {photo.week_number && <span className="badge bg-white text-dark me-2">Semana {photo.week_number}</span>}
              <span className="opacity-75">
                {format(parseISO(photo.photo_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-danger" onClick={onDelete}>
                <Trash2 size={14} />
              </button>
              <button className="btn btn-sm btn-light" onClick={onClose}>
                <X size={14} />
              </button>
            </div>
          </div>
          <img
            src={getPhotoUrl(photo.storage_path)}
            alt={photo.caption ?? ''}
            style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }}
          />
          {photo.caption && (
            <p className="text-white text-center mt-2 mb-0 px-3">{photo.caption}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function PhotosPage() {
  const { data: photos, isLoading, upload, remove } = usePhotos()
  const [showUpload, setShowUpload] = useState(false)
  const [lightbox, setLightbox] = useState<Photo | null>(null)
  const [activeCategory, setActiveCategory] = useState('__all')

  const filtered = activeCategory === '__all'
    ? photos
    : photos.filter(p => p.category === activeCategory)

  async function handleUpload(file: File, values: UploadValues) {
    await upload.mutateAsync({
      file,
      photo_date: values.photo_date,
      category: values.category,
      caption: values.caption || null,
      week_number: values.week_number === '' ? null : Number(values.week_number),
    })
    setShowUpload(false)
  }

  async function handleDelete(photo: Photo) {
    if (!confirm('Remover esta foto permanentemente?')) return
    setLightbox(null)
    await remove.mutateAsync({ id: photo.id, storagePath: photo.storage_path })
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
          <h4 className="fw-bold mb-0">Álbum de Fotos</h4>
          <p className="text-muted small mb-0">{photos.length} foto(s)</p>
        </div>
        <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={() => setShowUpload(true)}>
          <Plus size={16} />
          Adicionar foto
        </button>
      </div>

      {/* Category tabs */}
      {photos.length > 0 && (
        <ul className="nav nav-pills mb-4 gap-1 flex-wrap">
          <li className="nav-item">
            <button
              className={`nav-link btn btn-sm ${activeCategory === '__all' ? 'active' : 'text-secondary'}`}
              onClick={() => setActiveCategory('__all')}
              style={{ fontSize: '0.8rem' }}
            >
              Todas ({photos.length})
            </button>
          </li>
          {PHOTO_CATEGORIES.map(cat => {
            const count = photos.filter(p => p.category === cat.value).length
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

      {photos.length === 0 && (
        <div className="card border-0 shadow-sm p-5 text-center text-muted">
          <Camera size={40} className="mx-auto mb-3 opacity-50" />
          <p className="fw-semibold mb-1">Nenhuma foto ainda</p>
          <p className="small mb-3">
            Registre os momentos especiais da sua gestação — ultrassons, barriga em evolução, família e muito mais.
          </p>
          <button className="btn btn-primary btn-sm mx-auto" style={{ width: 'fit-content' }} onClick={() => setShowUpload(true)}>
            <Plus size={14} className="me-1" />
            Primeira foto
          </button>
        </div>
      )}

      {/* Photo grid */}
      <div className="row g-2">
        {filtered.map(photo => (
          <div key={photo.id} className="col-6 col-md-4 col-lg-3">
            <div
              className="position-relative rounded overflow-hidden"
              style={{ aspectRatio: '1 / 1', cursor: 'pointer', background: '#f1f5f9' }}
              onClick={() => setLightbox(photo)}
            >
              <img
                src={getPhotoUrl(photo.storage_path)}
                alt={photo.caption ?? ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                loading="lazy"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              {/* Overlay */}
              <div
                className="position-absolute bottom-0 start-0 end-0 px-2 py-1"
                style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', fontSize: '0.7rem', color: '#fff' }}
              >
                {photo.week_number && <span className="me-1">S{photo.week_number}</span>}
                {photo.caption && <span className="text-truncate d-block">{photo.caption}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUpload={handleUpload}
          loading={upload.isPending}
        />
      )}

      {lightbox && (
        <LightboxModal
          photo={lightbox}
          onClose={() => setLightbox(null)}
          onDelete={() => handleDelete(lightbox)}
        />
      )}
    </div>
  )
}
