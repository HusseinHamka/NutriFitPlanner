import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import { isMeaningfulMealItem } from '@/lib/planSnapshot'
import { fullName } from '@/lib/helpers'
import { dayTotalCalories, mealTotalCalories, optionTotalCalories } from '@/services/report/reportLayout'
import type { MealItem, ReportModel } from '@/types/domain'
import {
  REPORT_COLORS,
  clientSummary,
  dietDayHasContent,
  formatWaterIntake,
  hasMealSchedule,
  hasNutritionGoals,
  hasWorkoutContent,
  hasWorkoutGoals,
  hasWorkoutSchedule,
  hasWorkoutSessions,
  hasWorkoutStructure,
  mealSlotHasContent,
  planBadgeLabel,
  practitionerSubtitle,
  trainerNotes,
} from '@/services/report/reportLayout'
import { PdfBrandMark, PdfSectionIcon, type PdfReportIconKind } from '@/services/report/pdfIcons'

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
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/nunito-sans@latest/latin-600-normal.woff',
      fontWeight: 600,
    },
    {
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/nunito-sans@latest/latin-700-normal.woff',
      fontWeight: 700,
    },
  ],
})

const s = StyleSheet.create({
  page: {
    backgroundColor: REPORT_COLORS.cream,
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 36,
    fontFamily: 'NunitoSans',
    fontSize: 10,
    color: REPORT_COLORS.ink,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: REPORT_COLORS.deepForest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practitionerName: { fontFamily: 'Lora', fontSize: 18, color: REPORT_COLORS.deepForest },
  preparedByCaption: {
    fontSize: 7,
    letterSpacing: 0.8,
    color: REPORT_COLORS.muted,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  practitionerTitle: {
    fontSize: 7,
    letterSpacing: 1,
    color: REPORT_COLORS.muted,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  contactBlock: { alignItems: 'flex-end', gap: 2 },
  contactText: { fontSize: 9, color: REPORT_COLORS.muted },
  divider: {
    height: 2,
    backgroundColor: REPORT_COLORS.deepForest,
    marginTop: 14,
    marginBottom: 18,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: REPORT_COLORS.softSage,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 7,
    letterSpacing: 0.8,
    color: REPORT_COLORS.deepForest,
    fontWeight: 600,
  },
  title: {
    fontFamily: 'Lora',
    fontSize: 28,
    color: REPORT_COLORS.deepForest,
    marginBottom: 4,
  },
  subtitle: { fontSize: 10, color: REPORT_COLORS.muted, marginBottom: 16 },
  clientBar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: REPORT_COLORS.border,
    borderRadius: 8,
    backgroundColor: REPORT_COLORS.paper,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 18,
  },
  clientField: { flex: 1, paddingHorizontal: 6 },
  fieldLabel: {
    fontSize: 7,
    letterSpacing: 0.8,
    color: REPORT_COLORS.muted,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  fieldValue: { fontSize: 10, color: REPORT_COLORS.deepForest, fontWeight: 600 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  sectionIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: REPORT_COLORS.deepForest,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sectionTitle: { fontFamily: 'Lora', fontSize: 14, color: REPORT_COLORS.deepForest },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: REPORT_COLORS.border,
    marginLeft: 10,
  },
  bodyText: { fontSize: 10, color: REPORT_COLORS.ink, marginBottom: 10 },
  metricRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: REPORT_COLORS.border,
    borderRadius: 8,
    backgroundColor: REPORT_COLORS.paper,
    padding: 12,
  },
  metricLabel: {
    fontSize: 7,
    letterSpacing: 0.8,
    color: REPORT_COLORS.muted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metricValue: { fontFamily: 'Lora', fontSize: 18, color: REPORT_COLORS.deepForest },
  mealCard: {
    borderWidth: 1,
    borderColor: REPORT_COLORS.border,
    borderRadius: 8,
    backgroundColor: REPORT_COLORS.paper,
    marginBottom: 10,
    overflow: 'hidden',
  },
  mealTitle: {
    fontFamily: 'Lora',
    fontSize: 12,
    color: REPORT_COLORS.deepForest,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: REPORT_COLORS.softSage,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    fontSize: 7,
    letterSpacing: 0.8,
    color: REPORT_COLORS.deepForest,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: REPORT_COLORS.border,
  },
  tableRowAlt: { backgroundColor: REPORT_COLORS.sageLight },
  tableCell: { fontSize: 9, color: REPORT_COLORS.ink },
  mealNote: {
    fontSize: 8,
    fontStyle: 'italic',
    color: REPORT_COLORS.muted,
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 4,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: REPORT_COLORS.border,
    borderRadius: 8,
    backgroundColor: REPORT_COLORS.paper,
    padding: 12,
    marginBottom: 10,
  },
  infoBoxLabel: {
    fontSize: 7,
    letterSpacing: 0.8,
    color: REPORT_COLORS.muted,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  trainingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: REPORT_COLORS.softSage,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
    marginBottom: 6,
  },
  trainingTitle: {
    fontFamily: 'Lora',
    fontSize: 22,
    color: REPORT_COLORS.deepForest,
    marginBottom: 10,
  },
  scheduleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  schedulePill: {
    backgroundColor: REPORT_COLORS.sageLight,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  schedulePillText: { fontSize: 8, color: REPORT_COLORS.ink },
  dayCard: {
    borderWidth: 1,
    borderColor: REPORT_COLORS.border,
    borderRadius: 8,
    backgroundColor: REPORT_COLORS.paper,
    marginBottom: 10,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: REPORT_COLORS.border,
  },
  dayTitle: { fontFamily: 'Lora', fontSize: 12, color: REPORT_COLORS.deepForest },
  daySubtitle: {
    fontSize: 7,
    letterSpacing: 0.6,
    color: REPORT_COLORS.muted,
    textTransform: 'uppercase',
  },
  sessionCard: {
    borderWidth: 1,
    borderColor: REPORT_COLORS.border,
    borderRadius: 8,
    backgroundColor: REPORT_COLORS.paper,
    padding: 12,
    marginBottom: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: REPORT_COLORS.muted,
  },
  colFood: { width: '50%' },
  colQty: { width: '25%' },
  colKcal: { width: '25%', textAlign: 'right' },
  colExercise: { width: '34%' },
  colSets: { width: '12%' },
  colReps: { width: '12%' },
  colRest: { width: '18%' },
  colNotes: { width: '24%' },
  colSupName: { width: '40%' },
  colSupDose: { width: '30%' },
  colSupTiming: { width: '30%' },
})

function SectionHeader({ icon, title }: { icon: PdfReportIconKind; title: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionIcon}>
        <PdfSectionIcon kind={icon} />
      </View>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionLine} />
    </View>
  )
}

function PdfMealItemsTable({ items }: { items: MealItem[] }) {
  const visibleItems = items.filter(isMeaningfulMealItem)
  if (!visibleItems.length) return null

  return (
    <>
      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderCell, s.colFood]}>Food</Text>
        <Text style={[s.tableHeaderCell, s.colQty]}>Qty</Text>
        <Text style={[s.tableHeaderCell, s.colKcal]}>Kcal</Text>
      </View>
      {visibleItems.map((item, index) => (
        <View key={item.id} style={[s.tableRow, index % 2 === 1 ? s.tableRowAlt : {}]}>
          <Text style={[s.tableCell, s.colFood]}>{item.foodName || '—'}</Text>
          <Text style={[s.tableCell, s.colQty]}>
            {item.quantity != null ? `${item.quantity} ${item.unit}` : '—'}
          </Text>
          <Text style={[s.tableCell, s.colKcal]}>
            {item.calories != null ? String(item.calories) : '—'}
          </Text>
        </View>
      ))}
    </>
  )
}

function PdfMealCard({ title, subtitle, items, notes }: { title: string; subtitle?: string; items: MealItem[]; notes?: string }) {
  const visibleItems = items.filter(isMeaningfulMealItem)
  if (!visibleItems.length && !notes?.trim()) return null

  return (
    <View style={s.mealCard} wrap={false}>
      <Text style={s.mealTitle}>{title}</Text>
      {subtitle ? <Text style={s.mealNote}>{subtitle}</Text> : null}
      <PdfMealItemsTable items={items} />
      {notes ? <Text style={s.mealNote}>{notes}</Text> : null}
    </View>
  )
}

function PageFooter({
  model,
  pageNumber,
}: {
  model: ReportModel
  pageNumber: number
}) {
  const clientName = fullName(model.client.firstName, model.client.lastName)
  return (
    <View style={s.footer} fixed>
      <Text>{model.business.businessName} · {clientName}</Text>
      <Text>Page {pageNumber}</Text>
    </View>
  )
}

function ReportHeader({ model }: { model: ReportModel }) {
  const titleLine = practitionerSubtitle(model.business)

  return (
    <>
      <View style={s.headerRow}>
        <View style={s.brandRow}>
          {model.business.logoUrl ? (
            <Image src={model.business.logoUrl} style={{ width: 34, height: 34, borderRadius: 17 }} />
          ) : (
            <View style={s.logoCircle}>
              <PdfBrandMark />
            </View>
          )}
          <View>
            <Text style={s.preparedByCaption}>Prepared by</Text>
            <Text style={s.practitionerName}>{model.business.professionalName || model.business.businessName}</Text>
            {titleLine ? <Text style={s.practitionerTitle}>{titleLine}</Text> : null}
          </View>
        </View>
        <View style={s.contactBlock}>
          {model.business.phone ? <Text style={s.contactText}>{model.business.phone}</Text> : null}
          {model.business.email ? <Text style={s.contactText}>{model.business.email}</Text> : null}
        </View>
      </View>
      <View style={s.divider} />
    </>
  )
}

export function PdfReportDocument({ model }: { model: ReportModel }) {
  const diet = model.revision.snapshot.diet
  const workout = model.revision.snapshot.workout
  const client = clientSummary(model)
  const supplements = diet?.supplements ?? []
  const notes = trainerNotes(model)
  let pageNumber = 1

  const showNutritionGoals = diet != null && hasNutritionGoals(diet)
  const showMealSchedule = diet != null && hasMealSchedule(diet)
  const showRecommendations = diet != null && diet.recommendations.trim().length > 0
  const showDietNotes = diet != null && diet.notes.trim().length > 0

  const workoutContent = workout != null && hasWorkoutContent(workout)
  const showWorkoutGoals = workout != null && hasWorkoutGoals(workout)
  const showWorkoutSchedule = workout != null && hasWorkoutSchedule(workout)
  const showWorkoutSessions = workout != null && hasWorkoutSessions(workout)
  const showWorkoutStructure = workout != null && hasWorkoutStructure(workout)

  const showDietPage =
    diet != null &&
    (showMealSchedule || supplements.length > 0 || showRecommendations || showDietNotes || workoutContent)
  const showWorkoutPage = workout != null && (showWorkoutSchedule || showWorkoutSessions || showWorkoutStructure)

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <ReportHeader model={model} />
        <View style={s.badge}>
          <Text style={s.badgeText}>{planBadgeLabel(model.plan.type)}</Text>
        </View>
        <Text style={s.title}>Personalized Plan</Text>
        <Text style={s.subtitle}>Prepared on {client.preparedOn}</Text>

        <View style={s.clientBar}>
          {[
            { label: 'Client', value: client.name },
            { label: 'Age', value: client.age },
            { label: 'Sex', value: client.sex },
            { label: 'Height', value: client.height },
            { label: 'Weight', value: client.weight },
          ].map((field) => (
            <View key={field.label} style={s.clientField}>
              <Text style={s.fieldLabel}>{field.label}</Text>
              <Text style={s.fieldValue}>{field.value}</Text>
            </View>
          ))}
        </View>

        {diet && showNutritionGoals ? (
          <>
            <SectionHeader icon="nutrition" title="Nutrition goals" />
            {diet.goals.trim() ? <Text style={s.bodyText}>{diet.goals}</Text> : null}
            {diet.calorieTarget != null || diet.waterIntake.trim() ? (
              <View style={s.metricRow}>
                {diet.calorieTarget != null ? (
                  <View style={s.metricCard}>
                    <Text style={s.metricLabel}>Daily Calories</Text>
                    <Text style={s.metricValue}>{`${diet.calorieTarget} kcal`}</Text>
                  </View>
                ) : null}
                {diet.waterIntake.trim() ? (
                  <View style={s.metricCard}>
                    <Text style={s.metricLabel}>Water Intake</Text>
                    <Text style={s.metricValue}>{formatWaterIntake(diet.waterIntake)}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </>
        ) : null}

        <PageFooter model={model} pageNumber={pageNumber} />
      </Page>

      {diet && showDietPage ? (
        <Page size="A4" style={s.page}>
          <ReportHeader model={model} />
          {showMealSchedule ? (
            <>
              <SectionHeader icon="schedule" title={diet.scheduleMode === 'weekly' ? 'Meal schedule (Weekly)' : 'Meal schedule'} />
              {diet.scheduleMode === 'meal_options' ? (
                <Text style={s.bodyText}>Choose one option per meal.</Text>
              ) : null}
              {diet.scheduleMode === 'weekly'
                ? diet.weeklyDays.filter(dietDayHasContent).map((day) => (
                    <View key={day.id} wrap={false}>
                      <Text style={s.dayTitle}>{day.name}</Text>
                      {day.meals.map((meal) => (
                        <PdfMealCard
                          key={meal.id}
                          title={meal.name}
                          subtitle={`${mealTotalCalories(meal)} kcal`}
                          items={meal.items}
                          notes={meal.notes}
                        />
                      ))}
                      <Text style={s.mealNote}>Day total: {dayTotalCalories(day)} kcal</Text>
                    </View>
                  ))
                : diet.mealSlots.filter(mealSlotHasContent).map((slot) => (
                    <View key={slot.id} wrap={false}>
                      <Text style={s.dayTitle}>{slot.name}</Text>
                      {slot.options.map((option) => (
                        <PdfMealCard
                          key={option.id}
                          title={option.name}
                          subtitle={`${optionTotalCalories(option)} kcal`}
                          items={option.items}
                          notes={option.notes}
                        />
                      ))}
                    </View>
                  ))}
            </>
          ) : null}

          {supplements.length > 0 ? (
            <>
              <SectionHeader icon="star" title="Supplements" />
              <View style={s.mealCard} wrap={false}>
                <View style={s.tableHeader}>
                  <Text style={[s.tableHeaderCell, s.colSupName]}>Name</Text>
                  <Text style={[s.tableHeaderCell, s.colSupDose]}>Dose</Text>
                  <Text style={[s.tableHeaderCell, s.colSupTiming]}>Timing</Text>
                </View>
                {supplements.map((row, index) => (
                  <View key={row.id} style={[s.tableRow, index % 2 === 1 ? s.tableRowAlt : {}]}>
                    <Text style={[s.tableCell, s.colSupName]}>{row.name}</Text>
                    <Text style={[s.tableCell, s.colSupDose]}>{row.dose || '—'}</Text>
                    <Text style={[s.tableCell, s.colSupTiming]}>{row.timing || '—'}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {showRecommendations ? (
            <View style={s.infoBox}>
              <Text style={s.infoBoxLabel}>Recommendations</Text>
              <Text style={s.bodyText}>{diet.recommendations}</Text>
            </View>
          ) : null}

          {showDietNotes ? (
            <View style={s.infoBox}>
              <Text style={s.infoBoxLabel}>Notes</Text>
              <Text style={s.bodyText}>{diet.notes}</Text>
            </View>
          ) : null}

          {workout && workoutContent ? (
            <>
              <View style={s.trainingBadge}>
                <Text style={s.badgeText}>Training</Text>
              </View>
              <Text style={s.trainingTitle}>Weekly Training Plan</Text>
              {showWorkoutGoals ? (
                <>
                  <SectionHeader icon="star" title="Goals" />
                  <Text style={s.bodyText}>{workout.goals}</Text>
                </>
              ) : null}
            </>
          ) : null}

          <PageFooter model={model} pageNumber={++pageNumber} />
        </Page>
      ) : null}

      {workout && showWorkoutPage ? (
        <Page size="A4" style={s.page}>
          <ReportHeader model={model} />
          {showWorkoutSchedule ? (
            <>
              <SectionHeader icon="schedule" title="Weekly schedule" />
              <View style={s.scheduleRow}>
                {workout.days.map((day) => (
                  <View key={day.id} style={s.schedulePill}>
                    <Text style={s.schedulePillText}>{day.name}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {showWorkoutSessions ? (
            <>
              <SectionHeader icon="training" title="Training sessions" />
              {workout.days
                .filter((day) => day.exercises.some((exercise) => exercise.exerciseName.trim().length > 0))
                .map((day) => (
                  <View key={day.id} style={s.dayCard} wrap={false}>
                    <View style={s.dayHeader}>
                      <Text style={s.dayTitle}>{day.name}</Text>
                      {day.muscleGroups.trim() ? (
                        <Text style={s.daySubtitle}>{day.muscleGroups.toUpperCase()}</Text>
                      ) : null}
                    </View>
                    <View style={s.tableHeader}>
                      <Text style={[s.tableHeaderCell, s.colExercise]}>Exercise</Text>
                      <Text style={[s.tableHeaderCell, s.colSets]}>Sets</Text>
                      <Text style={[s.tableHeaderCell, s.colReps]}>Reps</Text>
                      <Text style={[s.tableHeaderCell, s.colRest]}>Rest</Text>
                      <Text style={[s.tableHeaderCell, s.colNotes]}>Notes</Text>
                    </View>
                    {day.exercises
                      .filter((exercise) => exercise.exerciseName.trim().length > 0)
                      .map((exercise, index) => (
                        <View key={exercise.id} style={[s.tableRow, index % 2 === 1 ? s.tableRowAlt : {}]}>
                          <Text style={[s.tableCell, s.colExercise]}>{exercise.exerciseName || '—'}</Text>
                          <Text style={[s.tableCell, s.colSets]}>{exercise.sets ?? '—'}</Text>
                          <Text style={[s.tableCell, s.colReps]}>{exercise.reps || '—'}</Text>
                          <Text style={[s.tableCell, s.colRest]}>{exercise.rest || '—'}</Text>
                          <Text style={[s.tableCell, s.colNotes]}>{exercise.notes || '—'}</Text>
                        </View>
                      ))}
                  </View>
                ))}
            </>
          ) : null}

          {showWorkoutStructure ? (
            <>
              <SectionHeader icon="session" title="Session structure" />
              {[
                { label: 'Warm-up', value: workout.warmup },
                { label: 'Cool-down', value: workout.cooldown },
                { label: 'Cardio', value: workout.cardio },
              ]
                .filter((item) => item.value.trim().length > 0)
                .map((item) => (
                  <View key={item.label} style={s.sessionCard}>
                    <Text style={s.infoBoxLabel}>{item.label}</Text>
                    <Text style={s.bodyText}>{item.value}</Text>
                  </View>
                ))}
            </>
          ) : null}

          <PageFooter model={model} pageNumber={++pageNumber} />
        </Page>
      ) : null}

      {notes ? (
        <Page size="A4" style={s.page}>
          <ReportHeader model={model} />
          <View style={s.infoBox}>
            <Text style={s.infoBoxLabel}>Trainer Notes</Text>
            <Text style={s.bodyText}>{notes}</Text>
          </View>
          <PageFooter model={model} pageNumber={++pageNumber} />
        </Page>
      ) : null}
    </Document>
  )
}
