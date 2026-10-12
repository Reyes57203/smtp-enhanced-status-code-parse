/**
 * Parse the three-digit enhanced status code from an SMTP response line.
 *
 * Enhanced status codes follow RFC 1893 / RFC 3463. The textual form is
 * `class.subject.detail`, for example `2.1.5`. The three fields together
 * form a single three-digit code: class is the first digit (2/4/5 for
 * success/persistent-failure/transient-failure per RFC 3463), subject and
 * detail each contribute one digit.
 *
 * Interpretation chosen (the README documents this):
 *
 * 1. We look for the first subsequence of the shape  D.D.D  where each D is
 *    a single decimal digit 0-9. This is the format the real-world server
 *    text after the numeric reply uses.
 *
 * 2. We treat it as a three-digit code: digits * 100 + digits * 10 + digits.
 *    We do NOT track the separate class/subject/detail fields because the
 *    brief asks for the three-digit code and nothing else. The constructor
 *    style `new StatusCode(...)` exists for callers who want the components.
 *
 * 3. We require each field to be exactly one digit. RFC 3463 allows subject
 *    and detail values greater than 9, but the standard textual representation
 *    in SMTP responses uses single digits; supporting multi-digit fields would
 *    be ambiguous without a context-free grammar. We choose single-digit.
 */

/**
 * @typedef {Object} ParseResult
 * @property {boolean}  ok            - true when a code was found.
 * @property {number|null} code      - the three-digit integer, or null when ok is false.
 * @property {string|null} text      - the matched "D.D.D" substring, or null.
 * @property {number|null} index     - start offset of the match in `line`, or null.
 * @property {number} classDigit     - first digit (0 when ok is false).
 * @property {number} subjectDigit   - second digit (0 when ok is false).
 * @property {number} detailDigit     - third digit (0 when ok is false).
 */

/**
 * Convenience class for callers who want structured field access.
 *
 * Construction is the caller's responsibility; parseEnhancedStatusCode uses
 * plain objects for its result so the public API has no class dependency.
 */
export class StatusCode {
  /**
   * @param {number} classDigit
   * @param {number} subjectDigit
   * @param {number} detailDigit
   */
  constructor(classDigit, subjectDigit, detailDigit) {
    this.classDigit = classDigit;
    this.subjectDigit = subjectDigit;
    this.detailDigit = detailDigit;
    /** The three-digit integer code. */
    this.code = classDigit * 100 + subjectDigit * 10 + detailDigit;
  }

  /** @returns {string} the canonical "D.D.D" text. */
  toString() {
    return `${this.classDigit}.${this.subjectDigit}.${this.detailDigit}`;
  }
}

// Match D.D.D where D is a single decimal digit. We use a capture group so
// we can recover the matched text reliably across engines without slicing.
const CODE_PATTERN = /(\d\.\d\.\d)/;

/**
 * Parse the enhanced status code from a single SMTP response line.
 *
 * @param {string} line - one SMTP response line (with or without the leading
 *   numeric reply code, with or without trailing text).
 * @returns {ParseResult} the parse outcome; see the type above.
 */
export function parseEnhancedStatusCode(line) {
  if (typeof line !== 'string') {
    throw new TypeError('line must be a string');
  }

  const match = CODE_PATTERN.exec(line);
  if (match === null) {
    return {
      ok: false,
      code: null,
      text: null,
      index: null,
      classDigit: 0,
      subjectDigit: 0,
      detailDigit: 0,
    };
  }

  const text = match[0];
  // text is exactly "D.D.D" so character indexing is safe and clear.
  const classDigit = text.charCodeAt(0) - 48;
  const subjectDigit = text.charCodeAt(2) - 48;
  const detailDigit = text.charCodeAt(4) - 48;
  const code = classDigit * 100 + subjectDigit * 10 + detailDigit;

  return {
    ok: true,
    code,
    text,
    index: match.index,
    classDigit,
    subjectDigit,
    detailDigit,
  };
}
