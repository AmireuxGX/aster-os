export type CalculatorErrorCode =
  | 'EMPTY_EXPRESSION'
  | 'EXPRESSION_TOO_LONG'
  | 'EXPRESSION_TOO_DEEP'
  | 'INVALID_CHARACTER'
  | 'INVALID_NUMBER'
  | 'UNEXPECTED_TOKEN'
  | 'MISMATCHED_PARENTHESES'
  | 'DIVISION_BY_ZERO'
  | 'NON_FINITE_RESULT'

export class CalculatorError extends Error {
  readonly code: CalculatorErrorCode
  readonly position: number

  constructor(code: CalculatorErrorCode, message: string, position: number) {
    super(message)
    this.name = 'CalculatorError'
    this.code = code
    this.position = position
  }
}

const MAX_EXPRESSION_LENGTH = 1_000
const MAX_PARENTHESES_DEPTH = 64

class CalculatorParser {
  private position = 0
  private parenthesesDepth = 0

  constructor(private readonly expression: string) {}

  parse(): number {
    this.skipWhitespace()
    if (this.isAtEnd()) {
      this.fail('EMPTY_EXPRESSION', '请输入算式')
    }

    const result = this.parseExpression()
    this.skipWhitespace()

    if (!this.isAtEnd()) {
      const token = this.current()
      if (token === ')') {
        this.fail('MISMATCHED_PARENTHESES', '缺少与右括号匹配的左括号')
      }
      if (token !== undefined && !this.isSupportedCharacter(token)) {
        this.fail('INVALID_CHARACTER', `不支持字符“${token}”`)
      }
      this.fail('UNEXPECTED_TOKEN', `无法解析“${token ?? ''}”`)
    }

    return result
  }

  private parseExpression(): number {
    let value = this.parseTerm()

    while (true) {
      this.skipWhitespace()
      const operator = this.current()
      if (operator !== '+' && operator !== '-') {
        return value
      }

      this.position += 1
      const right = this.parseTerm()
      value = operator === '+' ? value + right : value - right
      this.assertFinite(value)
    }
  }

  private parseTerm(): number {
    let value = this.parseUnary()

    while (true) {
      this.skipWhitespace()
      const operator = this.current()
      if (operator !== '*' && operator !== '/') {
        return value
      }

      this.position += 1
      const right = this.parseUnary()
      if (operator === '/' && right === 0) {
        this.fail('DIVISION_BY_ZERO', '不能除以零')
      }

      value = operator === '*' ? value * right : value / right
      this.assertFinite(value)
    }
  }

  private parseUnary(): number {
    this.skipWhitespace()
    const operator = this.current()

    if (operator === '+' || operator === '-') {
      this.position += 1
      const value = this.parseUnary()
      return operator === '-' ? -value : value
    }

    return this.parsePrimary()
  }

  private parsePrimary(): number {
    this.skipWhitespace()
    const token = this.current()

    if (token === undefined) {
      this.fail('UNEXPECTED_TOKEN', '算式结尾缺少数字')
    }

    if (token === '(') {
      return this.parseParenthesizedExpression()
    }

    if (token === ')') {
      this.fail('UNEXPECTED_TOKEN', '括号内缺少算式')
    }

    if (this.isDigit(token) || token === '.') {
      return this.parseNumber()
    }

    if (!this.isSupportedCharacter(token)) {
      this.fail('INVALID_CHARACTER', `不支持字符“${token}”`)
    }

    this.fail('UNEXPECTED_TOKEN', `此处不能使用“${token}”`)
  }

  private parseParenthesizedExpression(): number {
    const openingPosition = this.position
    this.position += 1
    this.parenthesesDepth += 1

    if (this.parenthesesDepth > MAX_PARENTHESES_DEPTH) {
      this.fail('EXPRESSION_TOO_DEEP', '括号嵌套层级过多', openingPosition)
    }

    this.skipWhitespace()
    if (this.current() === ')') {
      this.fail('UNEXPECTED_TOKEN', '括号内不能为空')
    }

    const value = this.parseExpression()
    this.skipWhitespace()
    if (this.current() !== ')') {
      this.fail('MISMATCHED_PARENTHESES', '缺少右括号', openingPosition)
    }

    this.position += 1
    this.parenthesesDepth -= 1
    return value
  }

  private parseNumber(): number {
    const start = this.position
    let digitCount = 0

    while (this.isDigit(this.current())) {
      this.position += 1
      digitCount += 1
    }

    if (this.current() === '.') {
      this.position += 1
      while (this.isDigit(this.current())) {
        this.position += 1
        digitCount += 1
      }
    }

    if (digitCount === 0 || this.current() === '.') {
      this.fail('INVALID_NUMBER', '数字格式不正确', start)
    }

    const value = Number(this.expression.slice(start, this.position))
    this.assertFinite(value, start)
    return value
  }

  private assertFinite(value: number, position = this.position): void {
    if (!Number.isFinite(value)) {
      this.fail('NON_FINITE_RESULT', '计算结果超出可表示范围', position)
    }
  }

  private skipWhitespace(): void {
    while (/\s/u.test(this.current() ?? '')) {
      this.position += 1
    }
  }

  private current(): string | undefined {
    return this.expression[this.position]
  }

  private isAtEnd(): boolean {
    return this.position >= this.expression.length
  }

  private isDigit(character: string | undefined): boolean {
    return character !== undefined && character >= '0' && character <= '9'
  }

  private isSupportedCharacter(character: string): boolean {
    return this.isDigit(character) || '.+-*/()'.includes(character) || /\s/u.test(character)
  }

  private fail(code: CalculatorErrorCode, message: string, position = this.position): never {
    throw new CalculatorError(code, message, position)
  }
}

/**
 * Safely evaluates a basic arithmetic expression without executing JavaScript.
 * Throws CalculatorError when the expression is invalid.
 */
export function calculateExpression(expression: string): number {
  if (expression.length > MAX_EXPRESSION_LENGTH) {
    throw new CalculatorError(
      'EXPRESSION_TOO_LONG',
      `算式过长（最多 ${MAX_EXPRESSION_LENGTH} 个字符）`,
      MAX_EXPRESSION_LENGTH,
    )
  }

  return new CalculatorParser(expression).parse()
}

