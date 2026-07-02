declare module 'compression' {
  import type { RequestHandler } from 'express'

  interface CompressionOptions {
    chunkSize?: number
    filter?: (req: unknown, res: unknown) => boolean
    level?: number
    memLevel?: number
    strategy?: number
    threshold?: number | string
    windowBits?: number
  }

  function compression(options?: CompressionOptions): RequestHandler

  namespace compression {
    function filter(req: unknown, res: unknown): boolean
  }

  export = compression
}
