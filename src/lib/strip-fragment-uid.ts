const originalWarn = console.warn
const originalError = console.error

const fragmentPropWarningPattern =
  /Invalid prop.*(%s|`[^`]*`).*supplied to.*(%s|`[^`]*`|Fragment|React\.Fragment)|Invalid prop.*supplied to.*Fragment|Invalid prop.*%s.*supplied/i

function shouldSuppress(args: unknown[]): boolean {
  const firstArg = args[0]
  if (typeof firstArg !== 'string') {
    return false
  }

  if (!fragmentPropWarningPattern.test(firstArg)) {
    return false
  }

  const combined = args.map((a) => (typeof a === 'string' ? a : '')).join(' ')

  const hasDataUid =
    combined.includes('data-uid') ||
    args.some((a) => typeof a === 'object' && a !== null && 'data-uid' in a)

  const hasFragmentRef = combined.includes('Fragment')

  return hasDataUid && hasFragmentRef
}

console.warn = (...args: unknown[]) => {
  if (shouldSuppress(args)) return
  originalWarn(...(args as Parameters<typeof console.warn>))
}

console.error = (...args: unknown[]) => {
  if (shouldSuppress(args)) return
  originalError(...(args as Parameters<typeof console.error>))
}
