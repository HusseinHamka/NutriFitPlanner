import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { measurementSchema, type MeasurementFormValues } from '@/lib/schemas'

const MEASUREMENT_LABELS: Record<keyof Pick<MeasurementFormValues, 'weight' | 'height' | 'bodyFatPercent' | 'chest' | 'waist' | 'hip' | 'arm' | 'thigh' | 'calf' | 'neck'>, string> = {
  weight: 'Weight (kg)',
  height: 'Height (cm)',
  bodyFatPercent: 'Body fat (%)',
  chest: 'Chest (cm)',
  waist: 'Waist (cm)',
  hip: 'Hip (cm)',
  arm: 'Arm (cm)',
  thigh: 'Thigh (cm)',
  calf: 'Calf (cm)',
  neck: 'Neck (cm)',
}

interface MeasurementFormProps {
  formId?: string
  showSubmit?: boolean
  submitting?: boolean
  onSubmit: (values: MeasurementFormValues) => void
}

export function MeasurementForm({ formId = 'measurement-form', showSubmit = false, submitting, onSubmit }: MeasurementFormProps) {
  const form = useForm<MeasurementFormValues>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      measuredAt: new Date().toISOString().slice(0, 10),
      weight: '',
      height: '',
      bodyFatPercent: '',
      chest: '',
      waist: '',
      hip: '',
      arm: '',
      thigh: '',
      calf: '',
      neck: '',
      notes: '',
    },
  })

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="measuredAt" render={({ field }) => (
          <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid gap-4 md:grid-cols-3">
          {(Object.keys(MEASUREMENT_LABELS) as Array<keyof typeof MEASUREMENT_LABELS>).map((name) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem>
                <FormLabel>{MEASUREMENT_LABELS[name]}</FormLabel>
                <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          ))}
        </div>
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        {showSubmit ? (
          <button type="submit" className="sr-only" disabled={submitting}>Save Measurement</button>
        ) : null}
      </form>
    </Form>
  )
}
