import { Font } from '@react-pdf/renderer'
import lora400 from '@fontsource/lora/files/lora-latin-400-normal.woff?url'
import lora700 from '@fontsource/lora/files/lora-latin-700-normal.woff?url'
import nunito400 from '@fontsource/nunito-sans/files/nunito-sans-latin-400-normal.woff?url'
import nunito600 from '@fontsource/nunito-sans/files/nunito-sans-latin-600-normal.woff?url'
import nunito700 from '@fontsource/nunito-sans/files/nunito-sans-latin-700-normal.woff?url'

let fontsReady: Promise<void> | null = null

async function toDataUrl(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load font asset (${response.status})`)
  }

  const blob = await response.blob()
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read font asset'))
    reader.readAsDataURL(blob)
  })
}

async function registerEmbeddedFonts(): Promise<void> {
  const [lora400Data, lora700Data, nunito400Data, nunito600Data, nunito700Data] = await Promise.all([
    toDataUrl(lora400),
    toDataUrl(lora700),
    toDataUrl(nunito400),
    toDataUrl(nunito600),
    toDataUrl(nunito700),
  ])

  Font.register({
    family: 'Lora',
    fonts: [
      { src: lora400Data, fontWeight: 400 },
      { src: lora700Data, fontWeight: 700 },
    ],
  })

  Font.register({
    family: 'NunitoSans',
    fonts: [
      { src: nunito400Data, fontWeight: 400 },
      { src: nunito600Data, fontWeight: 600 },
      { src: nunito700Data, fontWeight: 700 },
    ],
  })
}

export async function ensurePdfFontsLoaded() {
  if (!fontsReady) {
    fontsReady = registerEmbeddedFonts()
  }
  await fontsReady
}
