import { describe, it, expect, afterEach } from 'vitest'
import { generateKeyPairSync, KeyObject } from 'node:crypto'
import { loadPrivateKey, loadPubliceKey } from './loadKey'

const { privateKey, publicKey } = generateKeyPairSync('ed25519')
const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
const publicPem = publicKey.export({ type: 'spki', format: 'pem' }).toString()

afterEach(() => {
  delete process.env.TEST_PRIVATE_KEY
  delete process.env.TEST_PUBLIC_KEY
})

describe('loadPrivateKey', () => {
  it('loads a private KeyObject from a PEM env var', () => {
    process.env.TEST_PRIVATE_KEY = privatePem
    const key = loadPrivateKey('TEST_PRIVATE_KEY')
    expect(key).toBeInstanceOf(KeyObject)
    expect(key.type).toBe('private')
  })

  it('normalizes PEM stored with literal \\n escape sequences', () => {
    process.env.TEST_PRIVATE_KEY = privatePem.replace(/\n/g, '\\n')
    const key = loadPrivateKey('TEST_PRIVATE_KEY')
    expect(key.type).toBe('private')
  })

  it('throws when the env var is not set', () => {
    expect(() => loadPrivateKey('TEST_PRIVATE_KEY')).toThrow(/not set/)
  })

  it('throws on PEM missing BEGIN/END markers', () => {
    process.env.TEST_PRIVATE_KEY = 'not-a-pem'
    expect(() => loadPrivateKey('TEST_PRIVATE_KEY')).toThrow(/Invalid PEM/)
  })
})

describe('loadPubliceKey', () => {
  it('loads a public KeyObject from a PEM env var', () => {
    process.env.TEST_PUBLIC_KEY = publicPem
    const key = loadPubliceKey('TEST_PUBLIC_KEY')
    expect(key).toBeInstanceOf(KeyObject)
    expect(key.type).toBe('public')
  })

  it('throws when the env var is not set', () => {
    expect(() => loadPubliceKey('TEST_PUBLIC_KEY')).toThrow(/not set/)
  })
})
