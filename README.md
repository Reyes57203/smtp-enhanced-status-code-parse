# smtp-enhanced-status-code-parse

Parses the three-digit enhanced status code (`class.subject.detail`) from a single SMTP response line and returns it as an integer.

```js
import { parseEnhancedStatusCode } from 'smtp-enhanced-status-code-parse';

const r = parseEnhancedStatusCode('250 2.1.5 recipient ok');
// r.ok === true
// r.code === 215
// r.text === '2.1.5'
// r.classDigit === 2, r.subjectDigit === 1, r.detailDigit === 5
```

## Why this exists

SMTP servers following RFC 2034/3463 append an enhanced status code to their reply text. The numeric SMTP reply code (the leading `250`) and the enhanced code (the `2.1.5`) are two different things, and consumers that want the finer-grained classification need the latter pulled out of free-form prose.

This library does only that. It looks for the first substring matching `D.D.D` where each `D` is a single decimal digit, and returns the three-digit integer `class*100 + subject*10 + detail` together with the raw matched text and its offset.

## Edge you will hit

We require each field to be exactly one digit. RFC 3463 permits subject and detail values greater than 9, but the textual form used in actual SMTP responses uses single digits, and supporting multi-digit fields would make `2.1.10` ambiguous (is that `2.1.1` followed by `0`, or `2.1.10`?). If a server emits multi-digit fields, this parser returns the first single-digit match it finds. We pick single-digit and state it plainly.

## Exports

- `parseEnhancedStatusCode(line: string)` — returns `{ ok, code, text, index, classDigit, subjectDigit, detailDigit }`. When `ok` is `false`, `code`/`text`/`index` are `null` and the digit fields are `0`.
- `StatusCode` — convenience class taking `(classDigit, subjectDigit, detailDigit)` and exposing `.code` and `.toString()`.

## Running the tests

```
node --test
```

ESM only; Node 18+.

## Performance

The window keeps a bounded buffer, so `push` is constant time and memory does not
grow with the length of the stream. `peak` and `trough` are linear in the window
size, which is the trade that keeps `push` cheap.

