import { pdf } from '@react-pdf/renderer'
import { Document as DocxDocument, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'
import { fullName } from '@/lib/helpers'
import type { IExportService } from '@/services/abstractions'
import type { ReportModel } from '@/types/domain'
import { PdfReportDocument } from '@/services/report/PdfReportDocument'
import { clientSummary, planBadgeLabel, trainerNotes } from '@/services/report/reportLayout'

export class ExportService implements IExportService {
  async exportPdf(model: ReportModel): Promise<Blob> {
    return pdf(<PdfReportDocument model={model} />).toBlob()
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
        new Paragraph({ text: 'Meal Schedule', heading: HeadingLevel.HEADING_2 }),
      )
      diet.meals.forEach((meal) => {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: meal.name, bold: true })] }))
        meal.items.forEach((item) => {
          paragraphs.push(new Paragraph(`${item.foodName} · ${item.quantity ?? ''} ${item.unit} · ${item.calories ?? '—'} kcal`))
        })
        if (meal.notes) paragraphs.push(new Paragraph(meal.notes))
      })
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
