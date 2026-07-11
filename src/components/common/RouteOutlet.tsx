import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { PageLoading } from '@/components/common/PageLoading'

function OutletHost({ onMounted }: { onMounted: () => void }) {
  useEffect(() => {
    onMounted()
  }, [onMounted])

  return <Outlet />
}

export function RouteOutlet() {
  const location = useLocation()
  const [displayedPath, setDisplayedPath] = useState(location.pathname)
  const isTransitioning = location.pathname !== displayedPath

  if (isTransitioning) {
    return (
      <Suspense fallback={<PageLoading />}>
        <OutletHost
          key={location.pathname}
          onMounted={() => setDisplayedPath(location.pathname)}
        />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<PageLoading />}>
      <Outlet key={location.pathname} />
    </Suspense>
  )
}
