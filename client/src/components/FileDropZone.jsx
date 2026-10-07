import {useEffect, useRef, useState} from 'react'
import {Button} from 'react-bootstrap'
import {CloudUpload} from 'lucide-react'
import {ACCEPTED_EXTENSIONS, MAX_UPLOAD_MB, validateUpload} from '../content/uploads'

/**
 * Drag-and-drop area with a browse button. Calls onFile(file) for a valid
 * file and onError(message) otherwise. `children` replaces the default prompt.
 */
export default function FileDropZone({onFile, onError, disabled, compact, buttonLabel = 'Browse files', buttonVariant = 'primary', children}) {
  const inputRef = useRef(null)
  const [over, setOver] = useState(false)
  const depth = useRef(0) // dragenter/leave fire for child elements too

  // Stop the browser opening files dropped outside the zone (which would leave the site).
  useEffect(() => {
    const prevent = (e) => {
      if (e.dataTransfer?.types?.includes('Files')) e.preventDefault()
    }
    window.addEventListener('dragover', prevent)
    window.addEventListener('drop', prevent)
    return () => {
      window.removeEventListener('dragover', prevent)
      window.removeEventListener('drop', prevent)
    }
  }, [])

  const handle = (file) => {
    if (!file || disabled) return
    const err = validateUpload(file)
    if (err) onError?.(err)
    else onFile(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    depth.current = 0
    setOver(false)
    const files = e.dataTransfer.files
    if (files.length > 1) onError?.('Please drop one file at a time.')
    else handle(files[0])
  }

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault()
        depth.current++
        setOver(true)
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1)
        if (!depth.current) setOver(false)
      }}
      onDrop={onDrop}
      className={`rounded-4 text-center ${compact ? 'p-3' : 'p-4'}`}
      style={{
        border: `2px dashed ${over ? 'var(--bs-primary)' : 'var(--bs-border-color)'}`,
        background: over ? 'var(--app-dropzone-over)' : 'var(--app-dropzone-bg)',
        transition: 'background .15s, border-color .15s',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children || (
        <div className={compact ? 'small' : ''}>
          <span className='icon-tile mb-2' style={over ? {transform: 'scale(1.08)'} : undefined}>
            <CloudUpload size={20} aria-hidden='true' />
          </span>
          <div className='fw-semibold text-body-emphasis'>{over ? 'Drop it here' : 'Drag & drop your resume here'}</div>
          <div className='text-secondary small mb-2'>or</div>
        </div>
      )}
      <Button variant={buttonVariant} size={compact ? 'sm' : 'lg'} className='fw-semibold' disabled={disabled} onClick={() => inputRef.current?.click()}>
        {buttonLabel}
      </Button>
      <div className='text-secondary small mt-2'>PDF, DOCX or TXT · max {MAX_UPLOAD_MB} MB</div>
      <input
        ref={inputRef}
        type='file'
        accept={ACCEPTED_EXTENSIONS.join(',')}
        hidden
        onChange={(e) => {
          handle(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}
