'use client'
import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

export function PdfViewer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [numPages, setNumPages] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    setContainerWidth(el.clientWidth)
    const ro = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="w-full">
      {containerWidth > 0 && (
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-brand-marinho border-t-transparent rounded-full animate-spin" />
            </div>
          }
          error={
            <p className="text-center text-slate-400 text-sm py-10">
              Não foi possível carregar o documento.
            </p>
          }
        >
          {Array.from({ length: numPages }, (_, i) => (
            <div key={i} className={i < numPages - 1 ? 'mb-2' : ''}>
              <Page
                pageNumber={i + 1}
                width={containerWidth}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            </div>
          ))}
        </Document>
      )}
    </div>
  )
}
