import { pdf } from '@react-pdf/renderer'
import { Document as DocxDocument, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'
import { fullName } from '@/lib/helpers'
import type { IExportService } from '@/services/abstractions'
import type { ReportModel } from '@/types/domain'
import { ensurePdfFontsLoaded } from '@/services/report/pdfFonts'
import { PdfReportDocument } from '@/services/report/PdfReportDocument'
import { prepareReportModelForPdf } from '@/services/report/resolvePdfAssets'
import { clientSummary, dayTotalCalories, mealTotalCalories, optionTotalCalories, planBadgeLabel, trainerNotes } from '@/services/report/reportLayout'

export class ExportService implements IExportService {
  async exportPdf(model: ReportModel): Promise<Blob> {
    await ensurePdfFontsLoaded()
    const pdfModel = await prepareReportModelForPdf(model)

    // #region agent log
    {
      const diet = pdfModel.revision.snapshot.diet
      const workout = pdfModel.revision.snapshot.workout
      const weeklyDays = diet?.scheduleMode === 'weekly' ? diet.weeklyDays : []
      const dayStats = weeklyDays.map((day) => {
        const meals = day.meals.map((meal) => {
          const meaningful = meal.items.filter((item) => item.foodName.trim() || item.quantity != null || (item.calories != null && item.calories > 0))
          const kcalSum = meal.items.reduce((sum, item) => sum + (item.calories ?? 0), 0)
          const nullCalCount = meal.items.filter((item) => item.calories == null).length
          return {
            name: meal.name,
            itemCount: meal.items.length,
            meaningfulCount: meaningful.length,
            notesLen: meal.notes.trim().length,
            kcalSum,
            nullCalCount,
            wouldRenderCard: meaningful.length > 0 || meal.notes.trim().length > 0,
          }
        })
        return {
          name: day.name,
          mealCount: day.meals.length,
          renderedMeals: meals.filter((m) => m.wouldRenderCard).length,
          emptyMeals: meals.filter((m) => !m.wouldRenderCard).map((m) => m.name),
          dayKcal: meals.reduce((s, m) => s + m.kcalSum, 0),
          wrapFalseDayBlock: true,
          meals,
        }
      })
      const workoutDays = (workout?.days ?? []).map((day) => {
        const named = day.exercises.filter((e) => e.exerciseName.trim().length > 0)
        return {
          name: day.name,
          exerciseCount: day.exercises.length,
          namedExerciseCount: named.length,
          includedInSessions: named.length > 0,
          skippedReason: named.length === 0 ? (day.exercises.length ? 'unnamed_exercises' : 'no_exercises') : null,
        }
      })
      fetch('http://127.0.0.1:7597/ingest/8d91eb21-8a41-4b58-99d0-4b874f208f97', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a69cac' },
        body: JSON.stringify({
          sessionId: 'a69cac',
          runId: 'post-fix',
          hypothesisId: 'A,B,C,D,E',
          location: 'exportService.tsx:exportPdf',
          message: 'PDF export layout snapshot',
          data: {
            fixesApplied: {
              noItalicFont: true,
              noWrapFalseOnMeals: true,
              noWorkoutLeadInOnDietPage: true,
              filterEmptyMeals: true,
              hideZeroKcalLabels: true,
              dynamicPageNumbers: true,
            },
            scheduleMode: diet?.scheduleMode ?? null,
            hardPageSplit: {
              coverPage: true,
              dietPageIncludesTrainingLeadIn: Boolean(workout),
              separateWorkoutPage: Boolean(workout),
              separateNotesPage: Boolean(
                (diet?.notes?.trim() || workout?.notes?.trim()),
              ),
            },
            dayStats,
            workoutDays,
            workoutStructure: workout
              ? {
                  goals: workout.goals.trim().slice(0, 40),
                  warmupLen: workout.warmup.trim().length,
                  cooldownLen: workout.cooldown.trim().length,
                  cardioRaw: workout.cardio.trim().slice(0, 20),
                  cardioWouldShow: workout.cardio.trim().length > 0,
                }
              : null,
            mealCardWrapFalse: true,
            dayBlockWrapFalse: true,
            mealCardOverflowHidden: true,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {})
    }
    // #endregion

    return pdf(<PdfReportDocument model={pdfModel} />).toBlob()
  }

  async exportDocx(model: ReportModel): Promise<Blob> {
    const client = clientSummary(model)
    const clientName = fullName(model.client.firstName, model.client.lastName)
    const diet = model.revision.snapshot.diet
    const workout = model.revision.snapshot.workout

    const paragraphs: Paragraph[] = [
      new Paragraph({ text: model.business.professionalName || model.business.businessName, heading: HeadingLevel.TITLE }),
      new Paragraph(model.business.title),
      new Paragraph({ text: planBadgeLabel(model.plan.type), heading: HeadingLevel.HEADING_3 }),
      new Paragraph({ text: 'Personalized Plan', heading: HeadingLevel.HEADING_1 }),
      new Paragraph(`Prepared on ${client.preparedOn}`),
      new Paragraph(`Client: ${client.name} · Age: ${client.age} · Sex: ${client.sex} · Height: ${client.height} · Weight: ${client.weight}`),
    ]

    if (diet) {
      paragraphs.push(
        new Paragraph({ text: 'Nutrition Goals', heading: HeadingLevel.HEADING_2 }),
        new Paragraph(diet.goals || '—'),
        new Paragraph(`Daily Calories: ${diet.calorieTarget ?? '—'} kcal`),
        new Paragraph(`Water Intake: ${diet.waterIntake || '—'}`),
        new Paragraph({
          text: diet.scheduleMode === 'weekly' ? 'Meal Schedule (Weekly)' : 'Meal Schedule',
          heading: HeadingLevel.HEADING_2,
        }),
      )

      if (diet.scheduleMode === 'meal_options') {
        paragraphs.push(new Paragraph('Choose one option per meal.'))
      }

      if (diet.scheduleMode === 'weekly') {
        diet.weeklyDays.forEach((day) => {
          if (!day.meals.length) return
          paragraphs.push(new Paragraph({ children: [new TextRun({ text: day.name, bold: true })] }))
          day.meals.forEach((meal) => {
            paragraphs.push(new Paragraph({ children: [new TextRun({ text: `${meal.name} (${mealTotalCalories(meal)} kcal)`, bold: true })] }))
            meal.items.filter((item) => item.foodName.trim() || item.quantity != null || item.calories).forEach((item) => {
              paragraphs.push(new Paragraph(`${item.foodName} · ${item.quantity ?? ''} ${item.unit} · ${item.calories ?? '—'} kcal`))
            })
            if (meal.notes) paragraphs.push(new Paragraph(meal.notes))
          })
          paragraphs.push(new Paragraph(`Day total: ${dayTotalCalories(day)} kcal`))
        })
      } else {
        diet.mealSlots.forEach((slot) => {
          paragraphs.push(new Paragraph({ children: [new TextRun({ text: slot.name, bold: true })] }))
          slot.options.forEach((option) => {
            paragraphs.push(new Paragraph({ children: [new TextRun({ text: `${option.name} (${optionTotalCalories(option)} kcal)`, bold: true })] }))
            option.items.filter((item) => item.foodName.trim() || item.quantity != null || item.calories).forEach((item) => {
              paragraphs.push(new Paragraph(`${item.foodName} · ${item.quantity ?? ''} ${item.unit} · ${item.calories ?? '—'} kcal`))
            })
            if (option.notes) paragraphs.push(new Paragraph(option.notes))
          })
        })
      }

      diet.supplements.forEach((row) => {
        paragraphs.push(new Paragraph(`${row.name} · ${row.dose} · ${row.timing}`))
      })
      if (diet.recommendations) paragraphs.push(new Paragraph({ text: 'Recommendations', heading: HeadingLevel.HEADING_3 }), new Paragraph(diet.recommendations))
      if (diet.notes) paragraphs.push(new Paragraph({ text: 'Notes', heading: HeadingLevel.HEADING_3 }), new Paragraph(diet.notes))
    }

    if (workout) {
      paragraphs.push(
        new Paragraph({ text: 'Weekly Training Plan', heading: HeadingLevel.HEADING_2 }),
        new Paragraph(`Goals: ${workout.goals || '—'}`),
        new Paragraph(`Schedule: ${workout.days.map((day) => day.name).join(', ')}`),
      )
      workout.days.forEach((day, index) => {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: `Day ${index + 1} — ${day.muscleGroups || day.name}`, bold: true })] }))
        day.exercises.forEach((exercise) => {
          paragraphs.push(new Paragraph(`${exercise.exerciseName} · ${exercise.sets ?? ''} sets · ${exercise.reps} reps · ${exercise.rest}`))
        })
      })
      paragraphs.push(
        new Paragraph(`Warm-up: ${workout.warmup || '—'}`),
        new Paragraph(`Cool-down: ${workout.cooldown || '—'}`),
        new Paragraph(`Cardio: ${workout.cardio || '—'}`),
      )
    }

    const notes = trainerNotes(model)
    if (notes) {
      paragraphs.push(new Paragraph({ text: 'Trainer Notes', heading: HeadingLevel.HEADING_2 }), new Paragraph(notes))
    }

    paragraphs.push(new Paragraph(`${model.business.businessName} · ${clientName}`))

    const doc = new DocxDocument({
      sections: [{ properties: {}, children: paragraphs }],
    })

    return Packer.toBlob(doc)
  }
}
