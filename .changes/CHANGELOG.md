# API changes

Tags: `major`, `feat`, `fix`, `refact`

## Added

- Adicionado `_Regex` _(class)_ — src/natives/regex/implementations.ts
- Adicionado `isObject` _(function)_ — src/natives/object/implementations.ts
- Adicionado `MathUtils.static.getDecimals` _(member)_ — src/natives/math/utils.ts
- Adicionado `MathUtils.static.hasDecimals` _(member)_ — src/natives/math/utils.ts
- Adicionado `Parser` _(class)_ — src/parser/model.ts
- Adicionado `ParserGate` _(class)_ — src/parser/model.ts
- Adicionado `ParserNode` _(class)_ — src/parser/model.ts
- Adicionado `REGEX_PATTERNS` _(const)_ — src/natives/regex/declarations.ts
- Adicionado `StringUtils.static.charCodeArray` _(member)_ — src/natives/string/utils.ts
- Adicionado `StringUtils.static.forEach` _(member)_ — src/natives/string/utils.ts
- Adicionado `StringUtils.static.onChar` _(member)_ — src/natives/string/utils.ts
- Adicionado `StringUtils.static.padLeft` _(member)_ — src/natives/string/utils.ts
- Adicionado `StringUtils.static.padRight` _(member)_ — src/natives/string/utils.ts
- Adicionado `TDiff` _(type)_ — src/natives/object/types.ts
- Adicionado `TDiffValues` _(type)_ — src/natives/object/types.ts
- Adicionado `TIterate` _(type)_ — src/natives/object/types.ts
- Adicionado `TNonObject` _(type)_ — src/natives/object/types.ts
- Adicionado `TPathValue` _(type)_ — src/natives/object/types.ts
- Adicionado `TStrForEeachCallback` _(type)_ — src/natives/string/types.ts
- Adicionado `TStrToArray` _(type)_ — src/natives/string/types.ts
- Adicionado `TStrToUnion` _(type)_ — src/natives/string/types.ts
- Adicionado `TTimeConverted` _(type)_ — src/time/types.ts
- Adicionado `TTimeUnit` _(type)_ — src/time/types.ts

## Removed

- Removido `deleteProxy` _(function)_ — src/natives/object/proxy/implementations.ts
- Removido `proxyHandler` _(function)_ — src/natives/object/proxy/implementations.ts
- Removido `StringUtils.static.leftPad` _(member)_ — src/natives/string/utils.ts
- Removido `StringUtils.static.rightPad` _(member)_ — src/natives/string/utils.ts
- Removido `StringUtils.static.stringToCharCodeArray` _(member)_ — src/natives/string/utils.ts
- Removido `TArrayOptions` _(type)_ — src/natives/array/types.ts
- Removido `TDiffs` _(type)_ — src/natives/object/types.ts
- Removido `TPathResolver` _(type)_ — src/natives/object/types.ts
- Removido `TProperty` _(interface)_ — src/natives/object/proxy/types.ts
- Removido `TPropertyState` _(type)_ — src/natives/object/proxy/types.ts
- Removido `TProxyCallFunction` _(type)_ — src/natives/object/proxy/types.ts
- Removido `TProxyOptions` _(type)_ — src/natives/object/proxy/types.ts

## Changed

- Corrigido `MathUtils.static.clamp` _(member)_ — src/natives/math/utils.ts
- Corrigido `ObjectUtils.static.diffs` _(member)_ — src/natives/object/utils.ts
- Corrigido `ObjectUtils.static.isObjectLike` _(member)_ — src/natives/object/utils.ts
- Corrigido `ObjectUtils.static.setValueFromPath` _(member)_ — src/natives/object/utils.ts
- Corrigido `ObjectUtils.static.valueFromPath` _(member)_ — src/natives/object/utils.ts
- Corrigido `SpyUtils.static.timeExecution` _(member)_ — src/spy/utils.ts
- Corrigido `StringUtils.static.capitalize` _(member)_ — src/natives/string/utils.ts
- Corrigido `StringUtils.static.isCarriageReturn` _(member)_ — src/natives/string/utils.ts
- Corrigido `StringUtils.static.isDigit` _(member)_ — src/natives/string/utils.ts
- Corrigido `StringUtils.static.isEscape` _(member)_ — src/natives/string/utils.ts
- Corrigido `StringUtils.static.isFormatting` _(member)_ — src/natives/string/utils.ts
- Corrigido `StringUtils.static.isFormFeed` _(member)_ — src/natives/string/utils.ts
- Corrigido `StringUtils.static.isHexadecimal` _(member)_ — src/natives/string/utils.ts
- Corrigido `StringUtils.static.isIdentifier` _(member)_ — src/natives/string/utils.ts
- Corrigido `StringUtils.static.isLetter` _(member)_ — src/natives/string/utils.ts
- Corrigido `StringUtils.static.isLetterOrDigit` _(member)_ — src/natives/string/utils.ts
- Corrigido `StringUtils.static.isLineBreak` _(member)_ — src/natives/string/utils.ts
- Corrigido `StringUtils.static.isLowerCase` _(member)_ — src/natives/string/utils.ts
- Corrigido `StringUtils.static.isPunctuation` _(member)_ — src/natives/string/utils.ts
- Corrigido `StringUtils.static.isSymbol` _(member)_ — src/natives/string/utils.ts
- Corrigido `StringUtils.static.isTab` _(member)_ — src/natives/string/utils.ts
- Corrigido `StringUtils.static.isUpperCase` _(member)_ — src/natives/string/utils.ts
- Corrigido `StringUtils.static.isVerticalTab` _(member)_ — src/natives/string/utils.ts
- Corrigido `StringUtils.static.isWhitespace` _(member)_ — src/natives/string/utils.ts
- Corrigido `StringUtils.static.toKebabCase` _(member)_ — src/natives/string/utils.ts
- Corrigido `TargetImpl` _(type)_ — src/global/types.ts
- Corrigido `TArrayOf` _(type)_ — src/natives/array/types.ts
- Corrigido `TCommonFields` _(type)_ — src/natives/object/types.ts
- Corrigido `TDeepPartial` _(type)_ — src/natives/object/types.ts
- Corrigido `TFn` _(type)_ — src/natives/function/types.ts
- Corrigido `TimeUtils.static.convert` _(member)_ — src/time/utils.ts
- Corrigido `TKeyOf` _(type)_ — src/natives/object/types.ts
- Corrigido `TObject` _(type)_ — src/natives/object/types.ts
- Corrigido `TPath` _(type)_ — src/natives/object/types.ts
- Corrigido `TSameType` _(type)_ — src/types.ts
