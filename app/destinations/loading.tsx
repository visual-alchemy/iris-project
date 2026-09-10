import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen space-y-3 bg-crt-bg p-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
