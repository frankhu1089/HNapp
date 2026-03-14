// lib/logger.ts

const ts = () => new Date().toISOString()

export const log  = (...args: unknown[]) => console.log( `[${ts()}] INFO `, ...args)
export const warn = (...args: unknown[]) => console.warn(`[${ts()}] WARN `, ...args)
export const err  = (...args: unknown[]) => console.error(`[${ts()}] ERROR`, ...args)
