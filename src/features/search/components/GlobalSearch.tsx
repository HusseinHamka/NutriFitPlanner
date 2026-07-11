import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { queryKeys } from '@/lib/queryKeys'
import { services } from '@/services/container'

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timeout)
  }, [query])

  const searchQuery = useQuery({
    queryKey: queryKeys.search(debouncedQuery),
    queryFn: () => services.search.search(debouncedQuery),
    enabled: open && debouncedQuery.trim().length > 1,
  })

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) setQuery('')
  }

  const handleSelect = (href: string) => {
    setOpen(false)
    setQuery('')
    navigate(href)
  }

  const showEmpty = debouncedQuery.trim().length > 1 && !searchQuery.isFetching && !searchQuery.data?.length

  return (
    <>
      <Button variant="outline" className="w-full max-w-md justify-start text-muted-foreground" onClick={() => setOpen(true)}>
        <Search className="mr-2 h-4 w-4" />
        Search clients, foods, exercises, templates...
        <span className="ml-auto hidden text-xs md:inline">Ctrl+K</span>
      </Button>
      <CommandDialog open={open} onOpenChange={handleOpenChange} shouldFilter={false}>
        <CommandInput placeholder="Type to search..." value={query} onValueChange={setQuery} />
        <CommandList>
          {searchQuery.isFetching ? <p className="py-6 text-center text-sm text-muted-foreground">Searching…</p> : null}
          {showEmpty ? <CommandEmpty>No results found.</CommandEmpty> : null}
          {searchQuery.data?.length ? (
            <CommandGroup heading="Results">
              {searchQuery.data.map((result) => (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  value={`${result.title} ${result.subtitle}`}
                  onSelect={() => handleSelect(result.href)}
                >
                  <div>
                    <p>{result.title}</p>
                    <p className="text-xs text-muted-foreground">{result.subtitle}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  )
}
