'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import api from '@/lib/api'

interface Props {
  empreendimentoId: string
  fotos: string[]
  onChange: (fotos: string[]) => void
}

export function FotoUploader({ empreendimentoId, fotos, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [removingUrl, setRemovingUrl] = useState<string | null>(null)

  const onDrop = useCallback(async (files: File[]) => {
    if (!empreendimentoId) return
    setUploading(true)
    try {
      const form = new FormData()
      files.forEach(f => form.append('files', f))
      const res = await api.post(
        `/api/admin/empreendimentos/${empreendimentoId}/fotos`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      onChange(res.data.fotos as string[])
    } catch {
      alert('Erro ao enviar foto.')
    } finally {
      setUploading(false)
    }
  }, [empreendimentoId, onChange])

  const handleRemove = async (url: string) => {
    setRemovingUrl(url)
    try {
      const res = await api.delete(`/api/admin/empreendimentos/${empreendimentoId}/fotos`, {
        data: { url },
      })
      onChange(res.data.fotos as string[])
    } catch {
      alert('Erro ao remover foto.')
    } finally {
      setRemovingUrl(null)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (rejections) => {
      const msgs = rejections.map(r => {
        const name = r.file.name
        const reason = r.errors.some(e => e.code === 'file-too-large')
          ? 'arquivo muito grande (máx 30 MB)'
          : r.errors.map(e => e.message).join(', ')
        return `${name}: ${reason}`
      })
      alert('Arquivo(s) recusado(s):\n' + msgs.join('\n'))
    },
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 30 * 1024 * 1024,
    disabled: uploading || fotos.length >= 20,
  })

  return (
    <div>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-brand-azul bg-brand-gelo'
            : 'border-brand-borda hover:border-brand-azul hover:bg-brand-gelo/50'
        } ${fotos.length >= 20 ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-brand-texto/50">
            <Loader2 size={24} className="animate-spin" />
            <p className="font-sans text-sm">Enviando...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-brand-texto/50">
            <Upload size={24} />
            <p className="font-sans text-sm">
              {isDragActive ? 'Solte as fotos aqui' : 'Arraste fotos ou clique para selecionar'}
            </p>
            <p className="font-sans text-xs text-brand-texto/30">
              JPG, PNG, WebP · Máx 30 MB · {fotos.length}/20 fotos
            </p>
          </div>
        )}
      </div>

      {/* Preview grid */}
      {fotos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
          {fotos.map((url) => (
            <div key={url} className="relative aspect-square group rounded-lg overflow-hidden border border-brand-borda">
              <Image src={url} alt="Foto" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
              <button
                onClick={() => handleRemove(url)}
                disabled={removingUrl === url}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                {removingUrl === url
                  ? <Loader2 size={12} className="animate-spin" />
                  : <X size={12} />
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
