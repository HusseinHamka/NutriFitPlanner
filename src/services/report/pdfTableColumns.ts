/** Fixed column widths (pt) for react-pdf tables — percentages do not constrain text wrap reliably. */
export const PDF_TABLE_GAP = 10

/** ~499pt inner table width (A4 minus page + row padding). */
export const MEAL_TABLE_COLS = {
  food: 248,
  qty: 118,
  kcal: 113,
} as const

export const WORKOUT_TABLE_COLS = {
  exercise: 128,
  sets: 34,
  reps: 56,
  rest: 106,
  notes: 125,
} as const

export const SUPPLEMENT_TABLE_COLS = {
  name: 178,
  dose: 128,
  timing: 133,
} as const

export function tableCellStyle(width: number, isLast = false) {
  return {
    width,
    marginRight: isLast ? 0 : PDF_TABLE_GAP,
    paddingRight: isLast ? 0 : 4,
    borderRightWidth: isLast ? 0 : 1,
    borderRightColor: '#E8E4DC',
    flexGrow: 0,
    flexShrink: 0,
  } as const
}
