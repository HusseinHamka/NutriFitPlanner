import type { ReportModel } from '@/types/domain'

async function toDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const blob = await response.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/** Embeds remote logo images as data URLs so react-pdf can render them reliably. */
export async function prepareReportModelForPdf(model: ReportModel): Promise<ReportModel> {
  if (!model.business.logoUrl) return model

  const dataUrl = await toDataUrl(model.business.logoUrl)
  return {
    ...model,
    business: {
      ...model.business,
      logoUrl: dataUrl?.startsWith('data:') ? dataUrl : null,
    },
  }
}
