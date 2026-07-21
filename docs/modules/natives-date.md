[← Voltar para PROJECT.md](../PROJECT.md)

# natives/date

<a id="_Date"></a>
#### [`_Date`](../../src/natives/date/implementations.ts#L4) _(class)_

- `@internal`

<a id="trimmed"></a>
#### [`trimmed`](../../src/natives/date/implementations.ts#L11) _(const)_

<a id="match"></a>
#### [`match`](../../src/natives/date/implementations.ts#L14) _(const)_

<a id="year"></a>
#### [`year`](../../src/natives/date/implementations.ts#L17) _(const)_

<a id="month"></a>
#### [`month`](../../src/natives/date/implementations.ts#L18) _(const)_

<a id="day"></a>
#### [`day`](../../src/natives/date/implementations.ts#L19) _(const)_

<a id="date"></a>
#### [`date`](../../src/natives/date/implementations.ts#L20) _(const)_

<a id="isRealCalendarDate"></a>
#### [`isRealCalendarDate`](../../src/natives/date/implementations.ts#L22) _(const)_

<a id="parseISO"></a>
#### [`parseISO`](../../src/natives/date/implementations.ts#L32) _(const)_

Strict "yyyy-mm-dd" (ISO 8601 date) parse — `undefined` if empty, malformed, or not a real calendar date (e.g. 2024-02-30 is rejected, not rolled into March).

<a id="DateUtils"></a>
#### [`DateUtils`](../../src/natives/date/utils.ts#L4) _(class)_

Public static wrapper over `_Date` — strict date parsing.
