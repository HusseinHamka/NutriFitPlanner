import { saveAs } from 'file-saver'

function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isClassicIos = /iPad|iPhone|iPod/.test(ua)
  const isIpadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return isClassicIos || isIpadOs
}

/** Save a blob as a file. iOS Safari/Chrome cannot use programmatic downloads reliably. */
export function downloadBlob(blob: Blob, filename: string): boolean {
  const blobUrl = URL.createObjectURL(blob)

  if (isIosDevice()) {
    const link = document.createElement('a')
    link.href = blobUrl
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 120_000)
    return true
  }

  saveAs(blob, filename)
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1_000)
  return false
}
