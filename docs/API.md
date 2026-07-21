# Public API

Lista das declarações públicas de `@lotexiu/typescript` — só os nomes e o tipo de cada uma.

### (root)

- `TTypeOfValue` _(type, type-only)_
- `TNullable` _(type, type-only)_
- `TNotUndefined` _(type, type-only)_
- `TAs` _(type, type-only)_
- `TUnkown` _(type, type-only)_
- `TSameType` _(type, type-only)_

### capture-manager

- `CaptureManager` _(class)_

### filters

- `DEFAULT_DEBOUNCE_DURATION` _(const)_
- `DEFAULT_THROTTLE_INTERVAL` _(const)_
- `DEFAULT_STEP_AMOUNT` _(const)_
- `debounce` _(function)_
- `throttle` _(function)_
- `step` _(function)_
- `once` _(function)_
- `TDebounceFn` _(type, type-only)_
- `TThrottleFn` _(type, type-only)_
- `TStepFn` _(type, type-only)_
- `TOnceFn` _(type, type-only)_

### global

- `TargetImpl` _(type, type-only)_
- `GlobalUtils` _(class)_

### html/managers

- `TState` _(type, type-only)_

### html/managers/hotkey

- `hotkey` _(const)_
- `THotkeyItem` _(type, type-only)_
- `THotkeyCombo` _(type, type-only)_
- `THotkeyEvent` _(type, type-only)_
- `THotkeyElementValidator` _(type, type-only)_
- `THotkeyMatchData` _(type, type-only)_
- `THotkeyData` _(type, type-only)_

### html/managers/keyboard

- `keyboardManager` _(const)_
- `TFnKeysCode` _(type, type-only)_
- `TWordKeysCode` _(type, type-only)_
- `TDigitKeysCode` _(type, type-only)_
- `TModifierKeysCode` _(type, type-only)_
- `TNumPadKeysCode` _(type, type-only)_
- `TArrowKeysCode` _(type, type-only)_
- `TSpecialKeysCode` _(type, type-only)_
- `TKeyboardEventCode` _(type, type-only)_
- `TKeyboardOnEvent` _(type, type-only)_
- `TKeyboardState` _(type, type-only)_
- `TKeyboardValue` _(type, type-only)_

### html/managers/mouse

- `MOUSE_BUTTON_MAP` _(const)_
- `mouseManager` _(const)_
- `TMouseButtonsCode` _(type, type-only)_
- `TMouseButtons` _(type, type-only)_
- `TMouseCoord` _(type, type-only)_
- `TMouseOnEvent` _(type, type-only)_
- `TMouseValue` _(type, type-only)_
- `TMouseState` _(type, type-only)_

### html/managers/theme

- `themeManager` _(const)_
- `TTheme` _(type, type-only)_
- `TThemeOnEvent` _(type, type-only)_

### html/plugins

- `TPlugin` _(interface, type-only)_

### html/plugins/async-check

- `AsyncCheckPlugin` _(class)_
- `TAsyncCheckState` _(type, type-only)_
- `TAsyncCheckFn` _(type, type-only)_

### html/plugins/date

- `DatePlugin` _(class)_
- `TDateParseFn` _(type, type-only)_
- `TDatePluginOptions` _(interface, type-only)_

### html/plugins/interaction

- `InteractionPlugin` _(class)_
- `TInteractionState` _(type, type-only)_

### html/plugins/mask

- `MaskPlugin` _(class)_

### html/plugins/number

- `NumberPlugin` _(class)_
- `TNumberPluginOptions` _(interface, type-only)_

### html/plugins/registry

- `TYPE_PLUGIN_FACTORY` _(const)_
- `TTypePluginName` _(type, type-only)_
- `createTypePlugin` _(function)_

### mask

- `TUtilsMask` _(type, type-only)_
- `TMaskTokenKind` _(type, type-only)_
- `TMaskTokenMatcher` _(type, type-only)_
- `TMaskTokenRule` _(type, type-only)_
- `TMaskParserEntry` _(type, type-only)_
- `TMaskCompiledPattern` _(type, type-only)_
- `TMaskCompiled` _(type, type-only)_
- `TMaskApplyOptions` _(type, type-only)_
- `MaskUtils` _(class)_

### natives

- `TAwaited` _(type, type-only)_
- `TNoInfer` _(type, type-only)_
- `TNonNullable` _(type, type-only)_
- `TExclude` _(type, type-only)_
- `TExtract` _(type, type-only)_

### natives/array

- `TArray` _(type, type-only)_
- `TArrayLike` _(type, type-only)_
- `TExtractValues` _(type, type-only)_
- `TArrayType` _(type, type-only)_
- `TValueOf` _(type, type-only)_
- `TArrayOptions` _(type, type-only)_
- `TArrayRest` _(type, type-only)_
- `TArrayOf` _(type, type-only)_
- `TPair` _(type, type-only)_
- `TAsArray` _(type, type-only)_
- `TReverseArray` _(type, type-only)_
- `ArrayUtils` _(class)_

### natives/class

- `Timeout` _(type)_
- `instanceOf` _(function)_
- `TPrototype` _(type, type-only)_
- `TClazz` _(type, type-only)_
- `TExtendClass` _(type, type-only)_
- `TTimeout` _(type, type-only)_
- `ClassUtils` _(class)_

### natives/date

- `parseISO` _(const)_
- `DateUtils` _(class)_

### natives/function

- `TFn` _(type, type-only)_
- `TFnDeclaration` _(type, type-only)_
- `TBindFn` _(type, type-only)_
- `TModifyFnParameters` _(type, type-only)_
- `TModifyFnReturn` _(type, type-only)_
- `TParameters` _(type, type-only)_
- `TReturnType` _(type, type-only)_
- `TConstructor` _(type, type-only)_
- `TConstructorInfo` _(type, type-only)_
- `TConstructorParameters` _(type, type-only)_
- `TInstanceType` _(type, type-only)_

### natives/math

- `MathUtils` _(class)_

### natives/number

- `TDigit` _(type, type-only)_
- `TNumber` _(type, type-only)_
- `TAbs` _(type, type-only)_
- `TNegative` _(type, type-only)_
- `TPositive` _(type, type-only)_
- `TNegate` _(type, type-only)_
- `TDigitCompare` _(type, type-only)_
- `NumberUtils` _(class)_

### natives/object

- `isNull` _(function)_
- `isNullOrUndefined` _(function)_
- `json` _(function)_
- `TRequired` _(type, type-only)_
- `TReadonly` _(type, type-only)_
- `TPick` _(type, type-only)_
- `TOmit` _(type, type-only)_
- `TPartial` _(type, type-only)_
- `TObject` _(type, type-only)_
- `TRecord` _(type, type-only)_
- `TDeepPartial` _(type, type-only)_
- `TCommonFields` _(type, type-only)_
- `TPath` _(type, type-only)_
- `TPathResolver` _(type, type-only)_
- `TEntriesReturn` _(type, type-only)_
- `TKeyOf` _(type, type-only)_
- `TDiffs` _(type, type-only)_
- `ObjectUtils` _(class)_

### natives/object/proxy

- `proxyHandler` _(function)_
- `deleteProxy` _(function)_
- `TPropertyState` _(type, type-only)_
- `TProperty` _(interface, type-only)_
- `TProxyCallFunction` _(type, type-only)_
- `TProxyOptions` _(type, type-only)_

### natives/string

- `TReverseStr` _(type, type-only)_
- `StringUtils` _(class)_
- `TUString` _(type, type-only)_

### palette

- `buildTonalPalette` _(const)_
- `TToneStop` _(type, type-only)_
- `TTonalPalette` _(type, type-only)_
- `TTonalPaletteSeeds` _(type, type-only)_

### path-map

- `PathMap` _(class)_
- `TRecursiveMap` _(type, type-only)_

### rule-factory

- `createFactory` _(function)_
- `TRuleContext` _(type, type-only)_
- `TSlotRule` _(type, type-only)_
- `TFactoryRules` _(type, type-only)_
- `TFactoryResult` _(type, type-only)_

### spy

- `SpyUtils` _(class)_

### time

- `TimeUtils` _(class)_

### validation

- `required` _(function)_
- `pattern` _(function)_
- `ValidationUtils` _(class)_

### value-cell

- `ValueCell` _(class)_
- `TValueCellListener` _(type, type-only)_
- `TValueCellUnsubscribe` _(type, type-only)_

### value-history

- `ValueHistory` _(class)_
- `TIndexedItem` _(type, type-only)_
- `TValueHistoryType` _(type, type-only)_
- `TValueHistoryState` _(interface, type-only)_
- `TNewValueHistoryState` _(interface, type-only)_
- `TValueHistoryCallBack` _(type, type-only)_
- `TValueHistoryClearCallback` _(type, type-only)_

### variant-cell

- `VariantCell` _(class)_
- `TVariantDerive` _(type, type-only)_

---

Para descrição, exemplos e código-fonte, veja o repositório: https://github.com/lotexiu/typescript