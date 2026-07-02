import { describe, it, expect } from 'vitest'
import { AppError } from './app-error'

describe('AppError', () => {
  it('builds an operational error with message and status code', () => {
    const err = new AppError('boom', 418)
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(AppError)
    expect(err.message).toBe('boom')
    expect(err.statusCode).toBe(418)
    expect(err.isOperational).toBe(true)
  })

  it('allows overriding isOperational', () => {
    const err = new AppError('boom', 500, false)
    expect(err.isOperational).toBe(false)
  })

  it('captures a stack trace', () => {
    const err = new AppError('boom', 400)
    expect(err.stack).toBeTruthy()
  })

  describe('static constructors', () => {
    it('badRequest -> 400', () => {
      const err = AppError.badRequest('invalid')
      expect(err.statusCode).toBe(400)
      expect(err.message).toBe('invalid')
      expect(err.isOperational).toBe(true)
    })

    it('unauthorized -> 401 with default message', () => {
      expect(AppError.unauthorized().statusCode).toBe(401)
      expect(AppError.unauthorized().message).toBe('Unauthorized')
      expect(AppError.unauthorized('nope').message).toBe('nope')
    })

    it('notFound -> 404 with default message', () => {
      expect(AppError.notFound().statusCode).toBe(404)
      expect(AppError.notFound().message).toBe('Resource not found')
    })

    it('conflict -> 409', () => {
      expect(AppError.conflict('dup').statusCode).toBe(409)
    })

    it('tooMany -> 429 with default message', () => {
      expect(AppError.tooMany().statusCode).toBe(429)
      expect(AppError.tooMany().message).toBe('Too many requests')
    })

    it('internal -> 500 and non-operational', () => {
      const err = AppError.internal()
      expect(err.statusCode).toBe(500)
      expect(err.isOperational).toBe(false)
      expect(err.message).toBe('Internal server error')
    })
  })
})
