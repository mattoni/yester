function invariant(condition: boolean, message: string) {
  if (condition) {
    throw new Error(message);
  }
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function _compilePattern(pattern: string) {
  let regexpSource = ''
  const paramNames = []
  const tokens = []

  let match, lastIndex = 0, matcher = /:([a-zA-Z_$][a-zA-Z0-9_$]*)|\*\*|\*|\(|\)/g
  while ((match = matcher.exec(pattern))) {
    if (match.index !== lastIndex) {
      tokens.push(pattern.slice(lastIndex, match.index))
      regexpSource += escapeRegExp(pattern.slice(lastIndex, match.index))
    }

    if (match[1]) {
      regexpSource += '([^/]+)'
      paramNames.push(match[1])
    } else if (match[0] === '**') {
      regexpSource += '(.*)'
      paramNames.push('splat')
    } else if (match[0] === '*') {
      regexpSource += '(.*?)'
      paramNames.push('splat')
    } else if (match[0] === '(') {
      regexpSource += '(?:'
    } else if (match[0] === ')') {
      regexpSource += ')?'
    }

    tokens.push(match[0])

    lastIndex = matcher.lastIndex
  }

  if (lastIndex !== pattern.length) {
    tokens.push(pattern.slice(lastIndex, pattern.length))
    regexpSource += escapeRegExp(pattern.slice(lastIndex, pattern.length))
  }

  return {
    pattern,
    regexpSource,
    paramNames,
    tokens
  }
}

const CompiledPatternsCache = Object.create(null)

function compilePattern(pattern: string) {
  if (!CompiledPatternsCache[pattern])
    CompiledPatternsCache[pattern] = _compilePattern(pattern)

  return CompiledPatternsCache[pattern]
}

/** 
 * If you have a `:paramName` you get an object {paramName:value}
 * 
 * The last * or ** match is stored into `splat`
 **/
export interface MatchResultParams {
  splat?: string;
  [paramName: string]: string;
}

export interface MatchResult {
  remainingPath: string;
  params: MatchResultParams;
}

/**
 * Attempts to match a pattern on the given pathname. Patterns may use
 * the following special characters:
 *
 * - :paramName     Matches a URL segment up to the next /, ?, or #. The
 *                  captured string is considered a "param"
 * - ()             Wraps a segment of the URL that is optional
 * - *              Consumes (non-greedy) all characters up to the next
 *                  character in the pattern, or to the end of the URL if
 *                  there is none
 * - **             Consumes (greedy) all characters up to the next character
 *                  in the pattern, or to the end of the URL if there is none
 */
export function match({ pattern, path }: { pattern: string, path: string }): MatchResult | null {
  // Ensure pattern starts with leading slash for consistency with pathname.
  if (pattern.charAt(0) !== '/') {
    pattern = `/${pattern}`
  }
  let { regexpSource, paramNames, tokens } = compilePattern(pattern)

  if (pattern.charAt(pattern.length - 1) !== '/') {
    regexpSource += '/?' // Allow optional path separator at end.
  }

  // Special-case patterns like '*' for catch-all routes.
  if (tokens[tokens.length - 1] === '*') {
    regexpSource += '$'
  }

  const match = path.match(new RegExp(`^${regexpSource}`, 'i'))
  if (match == null) {
    return null
  }

  const matchedPath = match[0]
  let remainingPath = path.substr(matchedPath.length)

  if (remainingPath) {
    // Require that the match ends at a path separator, if we didn't match
    // the full path, so any remaining pathname is a new path segment.
    if (matchedPath.charAt(matchedPath.length - 1) !== '/') {
      return null
    }

    // If there is a remaining pathname, treat the path separator as part of
    // the remaining pathname for properly continuing the match.
    remainingPath = `/${remainingPath}`
  }

  /** 
   * Compose the param names and values into an object
   */
  const paramValues = match.slice(1).map(v => v && decodeURIComponent(v))
  const params = {}
  paramNames.forEach((paramName, index) => {
    params[paramName] = paramValues[index]
  })

  return {
    remainingPath,
    params
  }
}
