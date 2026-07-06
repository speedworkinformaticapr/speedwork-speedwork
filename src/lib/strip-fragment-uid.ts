const originalWarn = console.warn
const originalError = console.error

const fragmentPropWarningPattern = /Invalid prop.*supplied to/i

function shouldSuppress(args: unknown[]): boolean {
  const firstArg = args[0]
  if (typeof firstArg !== 'string' || !fragmentPropWarningPattern.test(firstArg)) {
    return false
  }

  const hasDataUid = args.some(
    (a) =>
      (typeof a === 'string' && a.includes('data-uid')) ||
      (typeof a === 'object' && a !== null && 'data-uid' in a),
  )

  const hasFragmentRef = args.some(
    (a) => typeof a === 'string' && (a.includes('React.Fragment') || a.includes('Fragment')),
  )

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
