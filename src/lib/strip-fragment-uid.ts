const originalWarn = console.warn
const originalError = console.error

const fragmentPropWarningPattern =
  /Invalid prop.*supplied to.*React\.Fragment|React\.Fragment can only have.*key.*children.*props/i

function shouldSuppress(args: unknown[]): boolean {
  const firstArg = args[0]
  return (
    typeof firstArg === 'string' &&
    fragmentPropWarningPattern.test(firstArg) &&
    args.some(
      (a) =>
        (typeof a === 'string' && a.includes('data-uid')) ||
        (typeof a === 'object' && a !== null && 'data-uid' in a),
    )
  )
}

console.warn = (...args: unknown[]) => {
  if (shouldSuppress(args)) return
  originalWarn(...(args as Parameters<typeof console.warn>))
}

console.error = (...args: unknown[]) => {
  if (shouldSuppress(args)) return
  originalError(...(args as Parameters<typeof console.error>))
}
