import { Font } from '@react-pdf/renderer'

let registered = false

export function registerPdfFonts() {
  if (registered) return
  registered = true

  Font.register({
    family: 'Lora',
    fonts: [
      {
        src: 'https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-normal.woff',
        fontWeight: 400,
      },
      {
        src: 'https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-700-normal.woff',
        fontWeight: 700,
      },
    ],
  })

  Font.register({
    family: 'NunitoSans',
    fonts: [
      {
        src: 'https://cdn.jsdelivr.net/fontsource/fonts/nunito-sans@latest/latin-400-normal.woff',
        fontWeight: 400,
      },
      {
        src: 'https://cdn.jsdelivr.net/fontsource/fonts/nunito-sans@latest/latin-400-italic.woff',
        fontWeight: 400,
        fontStyle: 'italic',
      },
      {
        src: 'https://cdn.jsdelivr.net/fontsource/fonts/nunito-sans@latest/latin-600-normal.woff',
        fontWeight: 600,
      },
      {
        src: 'https://cdn.jsdelivr.net/fontsource/fonts/nunito-sans@latest/latin-700-normal.woff',
        fontWeight: 700,
      },
    ],
  })
}

export async function ensurePdfFontsLoaded() {
  registerPdfFonts()
  await Promise.all([
    Font.load({ fontFamily: 'Lora', fontWeight: 400 }),
    Font.load({ fontFamily: 'Lora', fontWeight: 700 }),
    Font.load({ fontFamily: 'NunitoSans', fontWeight: 400 }),
    Font.load({ fontFamily: 'NunitoSans', fontWeight: 400, fontStyle: 'italic' }),
    Font.load({ fontFamily: 'NunitoSans', fontWeight: 600 }),
    Font.load({ fontFamily: 'NunitoSans', fontWeight: 700 }),
  ])
}
