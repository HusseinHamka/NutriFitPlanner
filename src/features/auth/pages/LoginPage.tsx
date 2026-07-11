import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { Navigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/context/AuthContext'
import { loginSchema, type LoginFormValues } from '@/lib/schemas'

export default function LoginPage() {
  const { session, signIn, resetPassword } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetting, setResetting] = useState(false)
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const clearAuthError = () => {
    if (authError) setAuthError(null)
  }

  if (session) return <Navigate to="/dashboard" replace />

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true)
    setAuthError(null)
    try {
      await signIn(values.email, values.password)
      toast.success('Signed in successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in'
      setAuthError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) return
    setResetting(true)
    try {
      await resetPassword(resetEmail)
      toast.success('Password reset email sent')
      setForgotOpen(false)
      setResetEmail('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to send reset email')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-4">
      <Card className="w-full max-w-md border-border bg-paper">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-deep-forest">NutriFit Pro</CardTitle>
          <CardDescription>Sign in to manage clients, plans, and reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {authError ? (
                <p className="rounded-[var(--radius)] border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
                  {authError}
                </p>
              ) : null}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} onChange={(e) => { clearAuthError(); field.onChange(e) }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          aria-label="Password"
                          className="pr-10"
                          {...field}
                          onChange={(e) => { clearAuthError(); field.onChange(e) }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword((value) => !value)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between">
                <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="link" className="h-auto p-0 text-sm">
                      Forgot password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-paper">
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        type="email"
                        placeholder="Your email address"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                      <Button
                        className="w-full bg-deep-forest hover:bg-deep-forest/90"
                        disabled={!resetEmail.trim() || resetting}
                        onClick={handleForgotPassword}
                      >
                        {resetting ? 'Sending…' : 'Send Reset Email'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Button type="submit" className="w-full bg-deep-forest hover:bg-deep-forest/90" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
