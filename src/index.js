/**
 * Public API for smtp-enhanced-status-code-parse.
 *
 * The library is intentionally small: a single parse function plus the
 * parsing helpers it uses. Importing from the package root keeps the public
 * surface stable even if internal module layout changes.
 */

export { parseEnhancedStatusCode } from './core.js';
