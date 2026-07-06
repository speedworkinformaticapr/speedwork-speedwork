const originalWarn = console.warn

const fragmentPropWarningPattern =
  /Invalid prop.*supplied to.*React\.Fragment|React\.Fragment can only have.*key.*children.*props/i

console.warn = (...args: unknown[]) => {
  const firstArg = args[0]
  if (
    typeof firstArg === 'string' &&
    fragmentPropWarningPattern.test(firstArg) &&
    args.some(
      (a) =>
        (typeof a === 'string' && a.includes('data-uid')) ||
        (typeof a === 'object' && a !== null && 'data-uid' in a),
    )
  ) {
    return
  }
  originalWarn(...(args as Parameters<typeof console.warn>)
}
