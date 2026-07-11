import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface PageLoadingProps {
  variant?: 'spinner' | 'skeleton'
}

export function PageLoading({ variant = 'spinner' }: PageLoadingProps) {
  if (variant === 'skeleton') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Loading...
    </div>
  )
}
