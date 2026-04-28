/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadCSV(data: any[], filename: string) {
  if (!data || !data.length) return
  const headers = Object.keys(data[0]).join(',')
  const rows = data
    .map((row) =>
      Object.values(row)
        .map((val) => `"${val || ''}"`)
        .join(','),
    )
    .join('\n')
  const csv = `${headers}\n${rows}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Add any other utility functions here
