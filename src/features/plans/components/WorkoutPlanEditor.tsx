import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LibraryExercisePicker } from '@/features/plans/components/LibraryExercisePicker'
import { createWorkoutDay, createWorkoutExercise } from '@/lib/planSnapshot'
import type { Exercise, WorkoutPlanContent } from '@/types/domain'

interface WorkoutPlanEditorProps {
  workout: WorkoutPlanContent
  onChange: (updates: Partial<WorkoutPlanContent>) => void
}

export function WorkoutPlanEditor({ workout, onChange }: WorkoutPlanEditorProps) {
  return (
    <div className="space-y-4">
      <Card className="border-border bg-paper">
        <CardHeader><CardTitle>Training Goals</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea placeholder="Goals (e.g. Bulking)" value={workout.goals} onChange={(e) => onChange({ goals: e.target.value })} />
        </CardContent>
      </Card>

      {workout.days.map((day, dayIndex) => (
        <Card key={day.id} className="border-border bg-paper">
          <CardHeader className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="grid flex-1 gap-3 md:grid-cols-2">
                <Input placeholder="Schedule label (e.g. Monday push)" value={day.name} onChange={(e) => {
                  const days = [...workout.days]
                  days[dayIndex] = { ...day, name: e.target.value }
                  onChange({ days })
                }} />
                <Input placeholder="Muscle groups (e.g. CHEST SHOULDER TRICEPS)" value={day.muscleGroups} onChange={(e) => {
                  const days = [...workout.days]
                  days[dayIndex] = { ...day, muscleGroups: e.target.value }
                  onChange({ days })
                }} />
              </div>
              <Button variant="ghost" size="icon" aria-label="Remove day" onClick={() => onChange({ days: workout.days.filter((d) => d.id !== day.id) })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={() => {
              const exercises = [...day.exercises, createWorkoutExercise(day.exercises.length)]
              const days = [...workout.days]
              days[dayIndex] = { ...day, exercises }
              onChange({ days })
            }}>Add Exercise</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {day.exercises.map((exercise, exerciseIndex) => (
              <div key={exercise.id} className="flex gap-2">
                <div className="grid flex-1 gap-2 md:grid-cols-6">
                  {exercise.mode === 'library' ? (
                    <LibraryExercisePicker
                      value={exercise.exerciseId ? { id: exercise.exerciseId, name: exercise.exerciseName } as Exercise : null}
                      onSelect={(selected) => {
                        const exercises = [...day.exercises]
                        exercises[exerciseIndex] = {
                          ...exercise,
                          mode: 'library',
                          exerciseId: selected.id,
                          exerciseName: selected.name,
                        }
                        const days = [...workout.days]
                        days[dayIndex] = { ...day, exercises }
                        onChange({ days })
                      }}
                    />
                  ) : (
                    <Input placeholder="Exercise" value={exercise.exerciseName} onChange={(e) => {
                      const exercises = [...day.exercises]
                      exercises[exerciseIndex] = { ...exercise, exerciseName: e.target.value, mode: 'custom', exerciseId: null }
                      const days = [...workout.days]
                      days[dayIndex] = { ...day, exercises }
                      onChange({ days })
                    }} />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const exercises = [...day.exercises]
                      exercises[exerciseIndex] = exercise.mode === 'library'
                        ? { ...exercise, mode: 'custom', exerciseId: null }
                        : { ...exercise, mode: 'library' }
                      const days = [...workout.days]
                      days[dayIndex] = { ...day, exercises }
                      onChange({ days })
                    }}
                  >
                    {exercise.mode === 'library' ? 'Custom' : 'Library'}
                  </Button>
                  <Input placeholder="Sets" type="number" value={exercise.sets ?? ''} onChange={(e) => {
                    const exercises = [...day.exercises]
                    exercises[exerciseIndex] = { ...exercise, sets: e.target.value ? Number(e.target.value) : null }
                    const days = [...workout.days]
                    days[dayIndex] = { ...day, exercises }
                    onChange({ days })
                  }} />
                  <Input placeholder="Reps" value={exercise.reps} onChange={(e) => {
                    const exercises = [...day.exercises]
                    exercises[exerciseIndex] = { ...exercise, reps: e.target.value }
                    const days = [...workout.days]
                    days[dayIndex] = { ...day, exercises }
                    onChange({ days })
                  }} />
                  <Input placeholder="Rest" value={exercise.rest} onChange={(e) => {
                    const exercises = [...day.exercises]
                    exercises[exerciseIndex] = { ...exercise, rest: e.target.value }
                    const days = [...workout.days]
                    days[dayIndex] = { ...day, exercises }
                    onChange({ days })
                  }} />
                  <Input placeholder="Notes" value={exercise.notes} onChange={(e) => {
                    const exercises = [...day.exercises]
                    exercises[exerciseIndex] = { ...exercise, notes: e.target.value }
                    const days = [...workout.days]
                    days[dayIndex] = { ...day, exercises }
                    onChange({ days })
                  }} />
                </div>
                <Button variant="ghost" size="icon" aria-label="Remove exercise" onClick={() => {
                  const days = [...workout.days]
                  days[dayIndex] = { ...day, exercises: day.exercises.filter((ex) => ex.id !== exercise.id) }
                  onChange({ days })
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" onClick={() => onChange({ days: [...workout.days, createWorkoutDay(workout.days.length)] })}>Add Day</Button>

      <Card className="border-border bg-paper">
        <CardHeader><CardTitle>Session Structure</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea placeholder="Warm-up" value={workout.warmup} onChange={(e) => onChange({ warmup: e.target.value })} />
          <Textarea placeholder="Cool-down" value={workout.cooldown} onChange={(e) => onChange({ cooldown: e.target.value })} />
          <Textarea placeholder="Cardio" value={workout.cardio} onChange={(e) => onChange({ cardio: e.target.value })} />
          <Textarea placeholder="Trainer notes" value={workout.notes} onChange={(e) => onChange({ notes: e.target.value })} />
        </CardContent>
      </Card>
    </div>
  )
}
