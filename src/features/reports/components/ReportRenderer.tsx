import { fullName } from '@/lib/helpers'
import { isMeaningfulMealItem } from '@/lib/planSnapshot'
import {
  REPORT_COLORS,
  clientSummary,
  dayTotalCalories,
  formatWaterIntake,
  mealTotalCalories,
  optionTotalCalories,
  planBadgeLabel,
  practitionerSubtitle,
  trainerNotes,
} from '@/services/report/reportLayout'
import type { Meal, MealItem, ReportModel } from '@/types/domain'

interface ReportRendererProps {
  model: ReportModel
}

function MealItemsTable({ items }: { items: MealItem[] }) {
  const visibleItems = items.filter(isMeaningfulMealItem)
  if (!visibleItems.length) return null

  return (
    <>
      <div className="mt-2 grid grid-cols-[2fr_1fr_1fr] gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: REPORT_COLORS.softSage, color: REPORT_COLORS.deepForest }}>
        <span>Food</span>
        <span>Qty</span>
        <span className="text-right">Kcal</span>
      </div>
      {visibleItems.map((item, index) => (
        <div
          key={item.id}
          className="grid grid-cols-[2fr_1fr_1fr] gap-2 border-t px-4 py-2 text-sm"
          style={{
            borderColor: REPORT_COLORS.border,
            backgroundColor: index % 2 === 1 ? REPORT_COLORS.sageLight : REPORT_COLORS.paper,
          }}
        >
          <span>{item.foodName || '—'}</span>
          <span>{item.quantity != null ? `${item.quantity} ${item.unit}` : '—'}</span>
          <span className="text-right">{item.calories ?? '—'}</span>
        </div>
      ))}
    </>
  )
}

function MealCard({ title, subtitle, items, notes }: { title: string; subtitle?: string; items: MealItem[]; notes?: string }) {
  const visibleItems = items.filter(isMeaningfulMealItem)
  if (!visibleItems.length && !notes?.trim()) return null

  return (
    <div className="overflow-hidden rounded-[var(--radius)] border" style={{ borderColor: REPORT_COLORS.border, backgroundColor: REPORT_COLORS.paper }}>
      <div className="px-4 pt-3">
        <p className="font-heading text-base" style={{ color: REPORT_COLORS.deepForest }}>{title}</p>
        {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      <MealItemsTable items={items} />
      {notes ? <p className="px-4 pb-3 text-xs italic text-muted-foreground">{notes}</p> : null}
    </div>
  )
}

function WeeklyMealSchedule({ meals, dayName }: { meals: Meal[]; dayName: string }) {
  if (!meals.length) return null

  return (
    <div className="space-y-3">
      <p className="font-heading text-lg" style={{ color: REPORT_COLORS.deepForest }}>{dayName}</p>
      {meals.map((meal) => (
        <MealCard
          key={meal.id}
          title={meal.name}
          subtitle={`${mealTotalCalories(meal)} kcal`}
          items={meal.items}
          notes={meal.notes}
        />
      ))}
    </div>
  )
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="mb-3 mt-2 flex items-center gap-3">
      <div
        className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-white"
        style={{ backgroundColor: REPORT_COLORS.deepForest }}
      >
        {icon}
      </div>
      <h3 className="font-heading text-lg" style={{ color: REPORT_COLORS.deepForest }}>
        {title}
      </h3>
      <div className="h-px flex-1" style={{ backgroundColor: REPORT_COLORS.border }} />
    </div>
  )
}

export function ReportRenderer({ model }: ReportRendererProps) {
  const diet = model.revision.snapshot.diet
  const workout = model.revision.snapshot.workout
  const client = clientSummary(model)
  const supplements = diet?.supplements ?? []
  const notes = trainerNotes(model)
  const titleLine = practitionerSubtitle(model.business)

  const pageClass = 'rounded-[var(--radius)] p-8 shadow-sm [break-after:page]'

  return (
    <div className="mx-auto max-w-[210mm] space-y-8" style={{ backgroundColor: REPORT_COLORS.cream, color: REPORT_COLORS.ink }}>
      {/* Page 1 */}
      <section className={pageClass} style={{ backgroundColor: REPORT_COLORS.cream }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {model.business.logoUrl ? (
              <img src={model.business.logoUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm text-white"
                style={{ backgroundColor: REPORT_COLORS.deepForest }}
              >
                ✿
              </div>
            )}
            <div>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: REPORT_COLORS.muted }}>Prepared by</p>
              <p className="font-heading text-xl" style={{ color: REPORT_COLORS.deepForest }}>
                {model.business.professionalName || model.business.businessName}
              </p>
              {titleLine ? (
                <p className="text-[10px] uppercase tracking-wider" style={{ color: REPORT_COLORS.muted }}>
                  {titleLine}
                </p>
              ) : null}
            </div>
          </div>
          <div className="text-right text-xs" style={{ color: REPORT_COLORS.muted }}>
            {model.business.phone ? <p>{model.business.phone}</p> : null}
            {model.business.email ? <p>{model.business.email}</p> : null}
          </div>
        </div>
        <div className="my-4 h-0.5" style={{ backgroundColor: REPORT_COLORS.deepForest }} />

        <span
          className="inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide"
          style={{ backgroundColor: REPORT_COLORS.softSage, color: REPORT_COLORS.deepForest }}
        >
          {planBadgeLabel(model.plan.type)}
        </span>
        <h2 className="mt-3 font-heading text-3xl" style={{ color: REPORT_COLORS.deepForest }}>
          Personalized Plan
        </h2>
        <p className="mt-1 text-sm" style={{ color: REPORT_COLORS.muted }}>
          Prepared on {client.preparedOn}
        </p>

        <div
          className="mt-5 grid grid-cols-2 gap-3 rounded-[var(--radius)] border p-4 md:grid-cols-5"
          style={{ borderColor: REPORT_COLORS.border, backgroundColor: REPORT_COLORS.paper }}
        >
          {[
            { label: 'Client', value: client.name },
            { label: 'Age', value: client.age },
            { label: 'Sex', value: client.sex },
            { label: 'Height', value: client.height },
            { label: 'Weight', value: client.weight },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: REPORT_COLORS.muted }}>
                {field.label}
              </p>
              <p className="text-sm font-semibold" style={{ color: REPORT_COLORS.deepForest }}>
                {field.value}
              </p>
            </div>
          ))}
        </div>

        {diet ? (
          <div className="mt-6">
            <SectionHeader icon="◆" title="Nutrition goals" />
            <p className="mb-4 text-sm">{diet.goals || '—'}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[var(--radius)] border p-4" style={{ borderColor: REPORT_COLORS.border, backgroundColor: REPORT_COLORS.paper }}>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: REPORT_COLORS.muted }}>Daily Calories</p>
                <p className="font-heading text-2xl" style={{ color: REPORT_COLORS.deepForest }}>
                  {diet.calorieTarget != null ? `${diet.calorieTarget} kcal` : '—'}
                </p>
              </div>
              <div className="rounded-[var(--radius)] border p-4" style={{ borderColor: REPORT_COLORS.border, backgroundColor: REPORT_COLORS.paper }}>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: REPORT_COLORS.muted }}>Water Intake</p>
                <p className="font-heading text-2xl" style={{ color: REPORT_COLORS.deepForest }}>
                  {formatWaterIntake(diet.waterIntake)}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Page 2 - Diet details */}
      {diet ? (
        <section className={pageClass} style={{ backgroundColor: REPORT_COLORS.cream }}>
          <SectionHeader icon="◷" title={diet.scheduleMode === 'weekly' ? 'Meal schedule (Weekly)' : 'Meal schedule'} />
          {diet.scheduleMode === 'meal_options' ? (
            <p className="mb-4 rounded-[var(--radius)] border px-3 py-2 text-sm" style={{ borderColor: REPORT_COLORS.border, backgroundColor: REPORT_COLORS.paper }}>
              Choose one option per meal.
            </p>
          ) : null}
          <div className="space-y-4">
            {diet.scheduleMode === 'weekly'
              ? diet.weeklyDays.map((day) => (
                  day.meals.length > 0 ? (
                    <div key={day.id} className="space-y-3">
                      <WeeklyMealSchedule meals={day.meals} dayName={day.name} />
                      <p className="text-sm text-muted-foreground">Day total: {dayTotalCalories(day)} kcal</p>
                    </div>
                  ) : null
                ))
              : diet.mealSlots.map((slot) => (
                  <div key={slot.id} className="space-y-3">
                    <p className="font-heading text-lg" style={{ color: REPORT_COLORS.deepForest }}>{slot.name}</p>
                    {slot.options.map((option) => (
                      <MealCard
                        key={option.id}
                        title={option.name}
                        subtitle={`${optionTotalCalories(option)} kcal`}
                        items={option.items}
                        notes={option.notes}
                      />
                    ))}
                  </div>
                ))}
          </div>

          {supplements.length > 0 ? (
            <div className="mt-6">
              <SectionHeader icon="✦" title="Supplements" />
              <div className="overflow-hidden rounded-[var(--radius)] border" style={{ borderColor: REPORT_COLORS.border }}>
                <div className="grid grid-cols-3 gap-2 px-4 py-2 text-[10px] font-bold uppercase" style={{ backgroundColor: REPORT_COLORS.softSage }}>
                  <span>Name</span>
                  <span>Dose</span>
                  <span>Timing</span>
                </div>
                {supplements.map((row) => (
                  <div key={row.id} className="grid grid-cols-3 gap-2 border-t px-4 py-2 text-sm" style={{ borderColor: REPORT_COLORS.border, backgroundColor: REPORT_COLORS.paper }}>
                    <span>{row.name}</span>
                    <span>{row.dose || '—'}</span>
                    <span>{row.timing || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {diet.recommendations ? (
            <div className="mt-4 rounded-[var(--radius)] border p-4" style={{ borderColor: REPORT_COLORS.border, backgroundColor: REPORT_COLORS.paper }}>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: REPORT_COLORS.muted }}>Recommendations</p>
              <p className="mt-2 text-sm">{diet.recommendations}</p>
            </div>
          ) : null}

          {diet.notes ? (
            <div className="mt-4 rounded-[var(--radius)] border p-4" style={{ borderColor: REPORT_COLORS.border, backgroundColor: REPORT_COLORS.paper }}>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: REPORT_COLORS.muted }}>Notes</p>
              <p className="mt-2 text-sm">{diet.notes}</p>
            </div>
          ) : null}

          {workout ? (
            <div className="mt-8">
              <span className="inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase" style={{ backgroundColor: REPORT_COLORS.softSage, color: REPORT_COLORS.deepForest }}>
                Training
              </span>
              <h3 className="mt-3 font-heading text-2xl" style={{ color: REPORT_COLORS.deepForest }}>Weekly Training Plan</h3>
              <SectionHeader icon="✦" title="Goals" />
              <p className="text-sm">{workout.goals || '—'}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Page 3 - Workout */}
      {workout ? (
        <section className={pageClass} style={{ backgroundColor: REPORT_COLORS.cream }}>
          <SectionHeader icon="◷" title="Weekly schedule" />
          <div className="mb-6 flex flex-wrap gap-2">
            {workout.days.map((day) => (
              <span key={day.id} className="rounded-full px-3 py-1 text-xs" style={{ backgroundColor: REPORT_COLORS.sageLight }}>
                {day.name}
              </span>
            ))}
          </div>

          <SectionHeader icon="⚖" title="Training sessions" />
          <div className="space-y-4">
            {workout.days.map((day) => (
              <div key={day.id} className="overflow-hidden rounded-[var(--radius)] border" style={{ borderColor: REPORT_COLORS.border, backgroundColor: REPORT_COLORS.paper }}>
                <div className="flex items-center justify-between border-b px-4 py-2" style={{ borderColor: REPORT_COLORS.border }}>
                  <p className="font-heading text-base" style={{ color: REPORT_COLORS.deepForest }}>{day.name}</p>
                  {day.muscleGroups.trim() ? (
                    <p className="text-[10px] uppercase tracking-wide" style={{ color: REPORT_COLORS.muted }}>{day.muscleGroups}</p>
                  ) : null}
                </div>
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr] gap-2 px-4 py-2 text-[10px] font-bold uppercase" style={{ backgroundColor: REPORT_COLORS.softSage }}>
                  <span>Exercise</span>
                  <span>Sets</span>
                  <span>Reps</span>
                  <span>Rest</span>
                  <span>Notes</span>
                </div>
                {day.exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr] gap-2 border-t px-4 py-2 text-sm"
                    style={{ borderColor: REPORT_COLORS.border, backgroundColor: index % 2 === 1 ? REPORT_COLORS.sageLight : REPORT_COLORS.paper }}
                  >
                    <span>{exercise.exerciseName || '—'}</span>
                    <span>{exercise.sets ?? '—'}</span>
                    <span>{exercise.reps || '—'}</span>
                    <span>{exercise.rest || '—'}</span>
                    <span>{exercise.notes || '—'}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <SectionHeader icon="◴" title="Session structure" />
            <div className="space-y-3">
              {[
                { label: 'Warm-up', value: workout.warmup },
                { label: 'Cool-down', value: workout.cooldown },
                { label: 'Cardio', value: workout.cardio },
              ].map((item) => (
                <div key={item.label} className="rounded-[var(--radius)] border p-4" style={{ borderColor: REPORT_COLORS.border, backgroundColor: REPORT_COLORS.paper }}>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: REPORT_COLORS.muted }}>{item.label}</p>
                  <p className="mt-2 text-sm">{item.value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {notes ? (
        <section className={pageClass} style={{ backgroundColor: REPORT_COLORS.cream }}>
          <div className="rounded-[var(--radius)] border p-4" style={{ borderColor: REPORT_COLORS.border, backgroundColor: REPORT_COLORS.paper }}>
            <p className="text-[10px] uppercase tracking-wide" style={{ color: REPORT_COLORS.muted }}>Trainer Notes</p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{notes}</p>
          </div>
        </section>
      ) : null}

      <footer className="px-8 pb-4 text-xs" style={{ color: REPORT_COLORS.muted }}>
        {model.business.businessName} · {fullName(model.client.firstName, model.client.lastName)}
      </footer>
    </div>
  )
}
