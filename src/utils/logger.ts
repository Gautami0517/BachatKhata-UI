const PREFIX = '[BenefitAI]'

export function logInfo(event: string, detail?: unknown): void {
  if (detail === undefined) {
    console.log(`${PREFIX} ${event}`)
    return
  }
  console.log(`${PREFIX} ${event}`, detail)
}

export function logWarn(event: string, detail?: unknown): void {
  if (detail === undefined) {
    console.warn(`${PREFIX} ${event}`)
    return
  }
  console.warn(`${PREFIX} ${event}`, detail)
}

export function logError(event: string, detail?: unknown): void {
  if (detail === undefined) {
    console.error(`${PREFIX} ${event}`)
    return
  }
  console.error(`${PREFIX} ${event}`, detail)
}
