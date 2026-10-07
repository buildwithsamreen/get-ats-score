// Client-side checks before uploading a resume file.
export const MAX_UPLOAD_MB = 5 // matches the server's multer limit
export const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.txt']

// Short, non-personal reason code for an upload error message (for analytics).
export function uploadErrorCode(message) {
  if (/\.doc\b/.test(message)) return 'doc-file'
  if (/too large/i.test(message)) return 'too-large'
  if (/unsupported/i.test(message)) return 'unsupported-type'
  if (/one file/i.test(message)) return 'multiple-files'
  if (/empty/i.test(message)) return 'empty-file'
  return 'other'
}

// Returns an error message, or null when the file can be uploaded.
export function validateUpload(file) {
  const ext = (file.name.match(/\.[^.]+$/)?.[0] || '').toLowerCase()
  if (ext === '.doc') return "Old .doc files aren't supported. Save it as .docx or PDF and try again."
  if (!ACCEPTED_EXTENSIONS.includes(ext)) return 'Unsupported file type. Upload a PDF, DOCX or TXT file.'
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return `That file is too large (max ${MAX_UPLOAD_MB} MB).`
  if (file.size === 0) return 'That file is empty.'
  return null
}
