import { createPrivateKey, createPublicKey, type KeyObject } from 'node:crypto'

const normalizePem = (raw: string): string => {
     const match = raw.match(/-----BEGIN ([A-Z ]+?)-----([\s\S]*?)-----END \1-----/)
     if (!match) {
          throw new Error('Invalid PEM: missing BEGIN/END markers')
     }
     const label = match[1].trim()
     const body = match[2].replace(/\\n/g, '').replace(/\s/g, '')
     const lines = body.match(/.{1,64}/g)?.join('\n') ?? ''
     return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----\n`
}

export const loadPrivateKey = (envKey: string): KeyObject => {
     const pem = process.env[envKey]
     if (!pem) {
          throw new Error(`Missing PASETO key: env var "${envKey}" is not set`)
     }
     return createPrivateKey(normalizePem(pem))
}
export const loadPubliceKey = (envKey: string): KeyObject => {
     const pem = process.env[envKey]
     if (!pem) {
          throw new Error(`Missing PASETO key: env var "${envKey}" is not set`)
     }
     return createPublicKey(normalizePem(pem))
}

export const derivePublicKeyFromPrivate = (envKey: string): KeyObject => {
     return createPublicKey(loadPrivateKey(envKey))
}
