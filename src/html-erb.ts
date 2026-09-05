import { sortClasses } from './sorting.js'
import type { StringChange, TransformerEnv } from './types'
import { spliceChangesIntoString } from './utils.js'

const RAW_TEXT_TAGS = new Set([
  'script',
  'style',
  'textarea',
  'title',
  'xmp',
  'iframe',
  'noembed',
  'noframes',
  'plaintext',
])

export function transformHtmlErb(ast: { text: string }, env: TransformerEnv) {
  ast.text = rewriteHtmlErb(ast.text, env)
}

function rewriteHtmlErb(source: string, env: TransformerEnv): string {
  let changes: StringChange[] = []
  let i = 0

  while (i < source.length) {
    if (source.startsWith('<%', i)) {
      let end = readErbEnd(source, i)
      if (end === null) break
      if (!source.startsWith('<%%', i)) sortStandaloneErb(source, i, end, env, changes)
      i = end
      continue
    }

    if (source[i] === '<') {
      i = scanMarkup(source, i, env, changes)
      continue
    }

    let next = source.indexOf('<', i)
    if (next === -1) break
    i = next
  }

  return spliceChangesIntoString(source, changes)
}

function scanMarkup(
  source: string,
  start: number,
  env: TransformerEnv,
  changes: StringChange[],
): number {
  if (source.startsWith('<!--', start)) return skipUntil(source, start + 4, '-->')
  if (source.startsWith('<![CDATA[', start)) return skipLiteral(source, start + 9, ']]>')
  if (source.startsWith('<!', start)) return skipUntil(source, start + 2, '>')
  if (source.startsWith('<?', start)) return skipUntil(source, start + 2, '?>')
  if (source.startsWith('</', start)) return skipUntil(source, start + 2, '>')
  return scanStartTag(source, start, env, changes)
}

function scanStartTag(
  source: string,
  start: number,
  env: TransformerEnv,
  changes: StringChange[],
): number {
  let i = start + 1
  if (!isNameStart(source[i] ?? '')) return start + 1

  let nameEnd = readWhile(source, i, isNameChar)
  let tagName = source.slice(i, nameEnd).toLowerCase()
  let local: StringChange[] = []
  i = nameEnd

  while (i < source.length) {
    if (source.startsWith('<%', i)) {
      i = readErbEnd(source, i) ?? source.length
      continue
    }

    let char = source[i] ?? ''
    if (isWs(char)) {
      i += 1
      continue
    }

    if (char === '>' || (char === '/' && source[i + 1] === '>')) {
      changes.push(...local)
      return skipRawBody(source, char === '>' ? i + 1 : i + 2, tagName)
    }

    if (char === '/') {
      i += 1
      continue
    }

    if (char === '<') return source.length

    let next = scanAttribute(source, i, env, local)
    if (next === null || next.fail || next.resume !== undefined) return source.length
    i = next.index
  }

  return source.length
}

function scanAttribute(
  source: string,
  start: number,
  env: TransformerEnv,
  local: StringChange[],
): { index: number; fail?: boolean; resume?: number } | null {
  if (!isAttrNameChar(source[start] ?? '')) return { index: start, fail: true }

  let i = readWhile(source, start, isAttrNameChar)
  let isClass = source.slice(start, i).toLowerCase() === 'class'
  i = skipWs(source, i)
  if (source[i] !== '=') return { index: i }

  i = skipWs(source, i + 1)
  let quote = source[i]
  if (quote === '"' || quote === "'") return scanQuotedValue(source, i, quote, isClass, env, local)
  return scanUnquotedValue(source, i)
}

function scanQuotedValue(
  source: string,
  quoteIndex: number,
  quote: string,
  isClass: boolean,
  env: TransformerEnv,
  local: StringChange[],
): { index: number; fail?: boolean; resume?: number } | null {
  let i = quoteIndex + 1
  let staticStart = i
  let hasErb = false
  let segments: [number, number][] = []

  while (i < source.length) {
    if (source.startsWith('<%', i)) {
      let end = readErbEnd(source, i)
      if (end === null) return null
      segments.push([staticStart, i])
      hasErb = true
      i = end
      staticStart = i
      continue
    }

    if (source[i] === quote) {
      segments.push([staticStart, i])
      if (isClass) sortClassSegments(source, segments, hasErb, env, local)
      return { index: i + 1 }
    }

    if (source[i] === '<') return { index: i, resume: i }
    i += 1
  }

  return null
}

function scanUnquotedValue(
  source: string,
  start: number,
): { index: number; fail?: boolean; resume?: number } | null {
  let i = start
  while (i < source.length) {
    if (source.startsWith('<%', i)) {
      i = readErbEnd(source, i) ?? -1
      if (i === -1) return null
      continue
    }

    let char = source[i] ?? ''
    if (isWs(char) || char === '>' || (char === '/' && source[i + 1] === '>')) return { index: i }
    if (char === '"' || char === "'" || char === '=') return { index: i, fail: true }
    if (char === '<') return { index: i, resume: i }
    i += 1
  }

  return null
}

function sortClassSegments(
  source: string,
  segments: [number, number][],
  hasErb: boolean,
  env: TransformerEnv,
  local: StringChange[],
) {
  for (let index = 0; index < segments.length; index++) {
    let [start, end] = segments[index]!
    if (start >= end) continue
    let value = source.slice(start, end)
    if (hasErb && isWsOnly(value)) continue

    let sorted = sortClasses(value, {
      env,
      ignoreFirst: hasErb && index > 0 && !isWs(value[0] ?? ''),
      ignoreLast: hasErb && index < segments.length - 1 && !isWs(value[value.length - 1] ?? ''),
      removeDuplicates: !hasErb,
      collapseWhitespace: hasErb ? false : undefined,
    })

    if (sorted !== value) local.push({ start, end, before: value, after: sorted })
  }
}

function sortStandaloneErb(
  source: string,
  start: number,
  end: number,
  env: TransformerEnv,
  changes: StringChange[],
) {
  if (isErbComment(source, start)) return

  let closeLen = source.slice(end - 3, end) === '-%>' ? 3 : 2
  let bodyStart = start + 2
  let rubyChanges = scanRubyClassStrings(source.slice(bodyStart, end - closeLen), env)
  if (!rubyChanges) return

  for (let change of rubyChanges) {
    changes.push({
      start: bodyStart + change.start,
      end: bodyStart + change.end,
      before: change.before,
      after: change.after,
    })
  }
}

function scanRubyClassStrings(body: string, env: TransformerEnv): StringChange[] | null {
  let changes: StringChange[] = []
  let i = 0

  while (i < body.length) {
    let char = body[i] ?? ''

    if (char === "'" || char === '"') {
      let end = scanRubyString(body, i)
      if (end === null) return null
      i = end
      continue
    }

    if (char === '#') {
      let newline = body.indexOf('\n', i)
      i = newline === -1 ? body.length : newline + 1
      continue
    }

    if (char === '`' || char === '/') return null
    if (char === '%' && body[i + 1] !== '=') return null
    if (
      body.startsWith('<<', i) ||
      isLineKeyword(body, i, '=begin') ||
      isLineKeyword(body, i, '__END__')
    ) {
      return null
    }

    if (isClassLabel(body, i)) {
      let next = trySortClassLabel(body, i, env, changes)
      if (next === null) return null
      i = next
      continue
    }

    i += 1
  }

  return changes
}

function trySortClassLabel(
  body: string,
  start: number,
  env: TransformerEnv,
  changes: StringChange[],
): number | null {
  let i = skipWs(body, start + 6)
  let quote = body[i]
  if (quote !== "'" && quote !== '"') return i

  let end = scanRubyString(body, i)
  if (end === null) return null

  let innerStart = i + 1
  let innerEnd = end - 1
  let inner = body.slice(innerStart, innerEnd)
  if (isSafeClassTerminator(body, skipWs(body, end))) {
    let sorted = sortClasses(inner, { env })
    if (sorted !== inner) {
      changes.push({ start: innerStart, end: innerEnd, before: inner, after: sorted })
    }
  }

  return end
}

function scanRubyString(body: string, start: number): number | null {
  let quote = body[start]
  let i = start + 1

  while (i < body.length) {
    let char = body[i] ?? ''
    if (char === '\\') return null
    if (
      quote === '"' &&
      char === '#' &&
      (body[i + 1] === '{' || body[i + 1] === '@' || body[i + 1] === '$')
    ) {
      return null
    }
    if (char === quote) return i + 1
    i += 1
  }

  return null
}

function isClassLabel(body: string, i: number): boolean {
  if (body.slice(i, i + 6) !== 'class:') return false
  if (i === 0) return true
  let prev = body[i - 1] ?? ''
  return (
    isWs(prev) ||
    prev === '(' ||
    prev === '{' ||
    prev === '[' ||
    prev === ',' ||
    prev === ';' ||
    prev === '|'
  )
}

function isSafeClassTerminator(body: string, i: number): boolean {
  if (i >= body.length) return true
  let char = body[i] ?? ''
  if (
    char === ',' ||
    char === ')' ||
    char === '}' ||
    char === ']' ||
    char === ';' ||
    char === '#'
  ) {
    return true
  }
  return isKeyword(body, i, 'do') || isKeyword(body, i, 'end')
}

function skipRawBody(source: string, start: number, tagName: string): number {
  if (!RAW_TEXT_TAGS.has(tagName)) return start
  if (tagName === 'plaintext') return source.length

  let needle = `</${tagName}`
  let i = start
  while (i < source.length) {
    if (source.startsWith('<%', i)) {
      i = readErbEnd(source, i) ?? source.length
      continue
    }

    if (source.slice(i, i + needle.length).toLowerCase() === needle) {
      let after = source[i + needle.length] ?? ''
      if (after === '' || isWs(after) || after === '>' || after === '/') {
        return skipUntil(source, i + needle.length, '>')
      }
    }

    i += 1
  }

  return source.length
}

function skipUntil(source: string, start: number, token: string): number {
  let i = start
  while (i < source.length) {
    if (source.startsWith('<%', i)) {
      i = readErbEnd(source, i) ?? source.length
      continue
    }
    if (source.startsWith(token, i)) return i + token.length
    i += 1
  }
  return source.length
}

function skipLiteral(source: string, start: number, token: string): number {
  let end = source.indexOf(token, start)
  return end === -1 ? source.length : end + token.length
}

function readErbEnd(source: string, start: number): number | null {
  let i = start + 2
  while (i < source.length - 1) {
    if (source[i] === '%' && source[i + 1] === '>') return i + 2
    i += 1
  }
  return null
}

function isErbComment(source: string, start: number): boolean {
  let i = start + 2
  if (source[i] === '-') i += 1
  return source[i] === '#'
}

function isLineKeyword(body: string, i: number, word: string): boolean {
  if (i > 0 && body[i - 1] !== '\n' && body[i - 1] !== '\r') return false
  return isKeyword(body, i, word)
}

function isKeyword(body: string, i: number, word: string): boolean {
  if (body.slice(i, i + word.length) !== word) return false
  if (i > 0 && isIdent(body[i - 1] ?? '')) return false
  return !isIdent(body[i + word.length] ?? '')
}

function skipWs(source: string, i: number): number {
  return readWhile(source, i, isWs)
}

function readWhile(source: string, start: number, test: (char: string) => boolean): number {
  let i = start
  while (i < source.length && test(source[i] ?? '')) i += 1
  return i
}

function isNameStart(char: string): boolean {
  return (char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z')
}

function isNameChar(char: string): boolean {
  return isNameStart(char) || (char >= '0' && char <= '9') || char === '-' || char === '_'
}

function isAttrNameChar(char: string): boolean {
  return (
    char !== '' &&
    !isWs(char) &&
    char !== '=' &&
    char !== '>' &&
    char !== '/' &&
    char !== '<' &&
    char !== '"' &&
    char !== "'"
  )
}

function isIdent(char: string): boolean {
  return (
    (char >= 'A' && char <= 'Z') ||
    (char >= 'a' && char <= 'z') ||
    (char >= '0' && char <= '9') ||
    char === '_'
  )
}

function isWs(char: string): boolean {
  return char === ' ' || char === '\t' || char === '\n' || char === '\r' || char === '\f'
}

function isWsOnly(value: string): boolean {
  for (let char of value) {
    if (!isWs(char)) return false
  }
  return true
}
