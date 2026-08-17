import { describe, expect, it } from 'vitest'
import { calculateExpression, CalculatorError } from './calculatorEngine'

describe('calculateExpression', () => {
  it('respects operator precedence and parentheses', () => {
    expect(calculateExpression('2 + 3 * 4')).toBe(14)
    expect(calculateExpression('(2 + 3) * 4')).toBe(20)
    expect(calculateExpression('18 / 3 / 2')).toBe(3)
  })

  it('supports decimals and unary operators', () => {
    expect(calculateExpression('-.5 * (-8 + 2)')).toBe(3)
    expect(calculateExpression('--4 + +1.5')).toBe(5.5)
    expect(calculateExpression('1. + .25')).toBe(1.25)
  })

  it('reports division by zero with a typed error', () => {
    expect(() => calculateExpression('10 / (3 - 3)')).toThrowError(
      expect.objectContaining<Partial<CalculatorError>>({ code: 'DIVISION_BY_ZERO' }),
    )
  })

  it.each([
    ['', 'EMPTY_EXPRESSION'],
    ['1 +', 'UNEXPECTED_TOKEN'],
    ['(1 + 2', 'MISMATCHED_PARENTHESES'],
    ['1 + 2)', 'MISMATCHED_PARENTHESES'],
    ['1..2', 'INVALID_NUMBER'],
    ['2(3)', 'UNEXPECTED_TOKEN'],
    ['Math.random()', 'INVALID_CHARACTER'],
  ] as const)('rejects invalid expression %j', (expression, code) => {
    expect(() => calculateExpression(expression)).toThrowError(
      expect.objectContaining<Partial<CalculatorError>>({ code }),
    )
  })

  it('limits input length and parenthesis depth', () => {
    expect(() => calculateExpression('1'.repeat(1_001))).toThrowError(
      expect.objectContaining<Partial<CalculatorError>>({ code: 'EXPRESSION_TOO_LONG' }),
    )

    const deeplyNested = `${'('.repeat(65)}1${')'.repeat(65)}`
    expect(() => calculateExpression(deeplyNested)).toThrowError(
      expect.objectContaining<Partial<CalculatorError>>({ code: 'EXPRESSION_TOO_DEEP' }),
    )
  })
})

