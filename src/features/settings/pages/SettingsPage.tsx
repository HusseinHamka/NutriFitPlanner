import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { queryKeys } from '@/lib/queryKeys'
import { businessSettingsSchema, type BusinessSettingsFormValues } from '@/lib/schemas'
import { services } from '@/services/container'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const settingsQuery = useQuery({ queryKey: queryKeys.settings, queryFn: () => services.settings.get() })

  const form = useForm<BusinessSettingsFormValues>({
    resolver: zodResolver(businessSettingsSchema),
    values: {
      professionalName: settingsQuery.data?.professionalName ?? '',
      businessName: settingsQuery.data?.businessName ?? '',
      title: settingsQuery.data?.title ?? '',
      phone: settingsQuery.data?.phone ?? '',
      email: settingsQuery.data?.email ?? '',
      address: settingsQuery.data?.address ?? '',
      website: settingsQuery.data?.website ?? '',
    },
  })

  const saveMutation = useMutation({
    mutationFn: (values: BusinessSettingsFormValues) => services.settings.upsert(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings })
      toast.success('Settings saved')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const uploadMutation = useMutation({
    mutationFn: async ({ file, kind }: { file: File; kind: 'logo' | 'signature' }) => {
      const url = await services.storage.uploadBusinessAsset(file, kind)
      return services.settings.updateAssetUrls(kind === 'logo' ? { logoUrl: url } : { signatureUrl: url })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings })
      toast.success('Asset uploaded')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-deep-forest">Business Settings</h1>
        <p className="text-muted-foreground">Professional details used in reports.</p>
      </div>
      <Card className="border-border bg-paper">
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="professionalName" render={({ field }) => (<FormItem><FormLabel>Professional Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="businessName" render={({ field }) => (<FormItem><FormLabel>Business Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="website" render={({ field }) => (<FormItem><FormLabel>Website</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" className="bg-deep-forest hover:bg-deep-forest/90" disabled={saveMutation.isPending}>Save Settings</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card className="border-border bg-paper">
        <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Logo</p>
            {settingsQuery.data?.logoUrl ? (
              <img src={settingsQuery.data.logoUrl} alt="Business logo" className="mb-3 h-16 w-16 rounded-[var(--radius)] border border-border object-contain" />
            ) : (
              <p className="mb-3 text-sm italic text-muted-foreground">No logo uploaded</p>
            )}
            <Input type="file" accept="image/*" onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) uploadMutation.mutate({ file, kind: 'logo' })
            }} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Signature</p>
            {settingsQuery.data?.signatureUrl ? (
              <img src={settingsQuery.data.signatureUrl} alt="Signature" className="mb-3 h-16 max-w-[200px] rounded-[var(--radius)] border border-border object-contain" />
            ) : (
              <p className="mb-3 text-sm italic text-muted-foreground">No signature uploaded</p>
            )}
            <Input type="file" accept="image/*" onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) uploadMutation.mutate({ file, kind: 'signature' })
            }} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
