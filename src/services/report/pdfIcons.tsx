import { Circle, Line, Path, Svg } from '@react-pdf/renderer'

export type PdfReportIconKind =
  | 'nutrition'
  | 'schedule'
  | 'star'
  | 'training'
  | 'session'
  | 'brand'

interface IconProps {
  size?: number
}

/** Simple flower mark used when no business logo is uploaded. */
export function PdfBrandMark({ size = 14 }: IconProps) {
  return (
    <Svg viewBox="0 0 16 16" width={size} height={size}>
      <Circle cx="8" cy="8" r="2.2" fill="#FFFFFF" />
      <Circle cx="8" cy="3.2" r="2.4" fill="#FFFFFF" />
      <Circle cx="8" cy="12.8" r="2.4" fill="#FFFFFF" />
      <Circle cx="3.2" cy="8" r="2.4" fill="#FFFFFF" />
      <Circle cx="12.8" cy="8" r="2.4" fill="#FFFFFF" />
    </Svg>
  )
}

function NutritionGoalsIcon({ size = 11 }: IconProps) {
  return (
    <Svg viewBox="0 0 12 12" width={size} height={size}>
      <Path d="M6 1.5 L10.5 6 L6 10.5 L1.5 6 Z" fill="#FFFFFF" />
    </Svg>
  )
}

function ScheduleIcon({ size = 11 }: IconProps) {
  return (
    <Svg viewBox="0 0 12 12" width={size} height={size}>
      <Circle cx="6" cy="6" r="4.5" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
      <Line x1="6" y1="6" x2="6" y2="3.2" stroke="#FFFFFF" strokeWidth="1.2" />
      <Line x1="6" y1="6" x2="8.4" y2="7.2" stroke="#FFFFFF" strokeWidth="1.2" />
    </Svg>
  )
}

function StarIcon({ size = 11 }: IconProps) {
  return (
    <Svg viewBox="0 0 12 12" width={size} height={size}>
      <Path
        d="M6 1.2 L7.4 4.6 L11 4.9 L8.2 7.2 L9.1 10.8 L6 8.9 L2.9 10.8 L3.8 7.2 L1 4.9 L4.6 4.6 Z"
        fill="#FFFFFF"
      />
    </Svg>
  )
}

function TrainingIcon({ size = 11 }: IconProps) {
  return (
    <Svg viewBox="0 0 12 12" width={size} height={size}>
      <Line x1="6" y1="1.5" x2="6" y2="10.5" stroke="#FFFFFF" strokeWidth="1.2" />
      <Line x1="2" y1="3.5" x2="10" y2="3.5" stroke="#FFFFFF" strokeWidth="1.2" />
      <Path
        d="M2 3.5 C2 5.8 3.4 7.2 6 7.2 C8.6 7.2 10 5.8 10 3.5"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        fill="none"
      />
      <Circle cx="2" cy="3.5" r="1.2" fill="#FFFFFF" />
      <Circle cx="10" cy="3.5" r="1.2" fill="#FFFFFF" />
    </Svg>
  )
}

function SessionIcon({ size = 11 }: IconProps) {
  return (
    <Svg viewBox="0 0 12 12" width={size} height={size}>
      <Circle cx="6" cy="6" r="4.5" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
      <Path d="M6 6 L6 1.5 A4.5 4.5 0 0 1 10.5 6 Z" fill="#FFFFFF" />
    </Svg>
  )
}

export function PdfSectionIcon({ kind }: { kind: PdfReportIconKind }) {
  switch (kind) {
    case 'nutrition':
      return <NutritionGoalsIcon />
    case 'schedule':
      return <ScheduleIcon />
    case 'star':
      return <StarIcon />
    case 'training':
      return <TrainingIcon />
    case 'session':
      return <SessionIcon />
    case 'brand':
      return <PdfBrandMark />
    default:
      return null
  }
}
