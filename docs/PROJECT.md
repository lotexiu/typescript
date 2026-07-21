# Project documentation

Gerado por `scripts/tools/docs-generator.ts`. Lista todos os recursos do projeto, exportados ou não — cada nome aponta pro arquivo do módulo correspondente (`modules/`), que tem descrição e tags; o código real fica só no arquivo-fonte (o próprio módulo já linka pra lá).

### (root)

- [`String`](modules/root.md#String) _(interface)_
- [`Function`](modules/root.md#Function) _(interface)_
- [`_typeof`](modules/root.md#_typeof) _(const)_
- [`TTypeOfValue`](modules/root.md#TTypeOfValue) _(type, type-only)_
- [`TNullable`](modules/root.md#TNullable) _(type, type-only)_
- [`TNotUndefined`](modules/root.md#TNotUndefined) _(type, type-only)_
- [`TAs`](modules/root.md#TAs) _(type, type-only)_
- [`TUnkown`](modules/root.md#TUnkown) _(type, type-only)_
- [`TSameType`](modules/root.md#TSameType) _(type, type-only)_

### capture-manager

- [`CaptureManager`](modules/capture-manager.md#CaptureManager) _(class)_

### filters

- [`DEFAULT_DEBOUNCE_DURATION`](modules/filters.md#DEFAULT_DEBOUNCE_DURATION) _(const)_
- [`DEFAULT_THROTTLE_INTERVAL`](modules/filters.md#DEFAULT_THROTTLE_INTERVAL) _(const)_
- [`DEFAULT_STEP_AMOUNT`](modules/filters.md#DEFAULT_STEP_AMOUNT) _(const)_
- [`debounce`](modules/filters.md#debounce) _(function)_
- [`throttle`](modules/filters.md#throttle) _(function)_
- [`step`](modules/filters.md#step) _(function)_
- [`once`](modules/filters.md#once) _(function)_
- [`TDebounceFn`](modules/filters.md#TDebounceFn) _(type, type-only)_
- [`TThrottleFn`](modules/filters.md#TThrottleFn) _(type, type-only)_
- [`TStepFn`](modules/filters.md#TStepFn) _(type, type-only)_
- [`TOnceFn`](modules/filters.md#TOnceFn) _(type, type-only)_

### global

- [`_Global`](modules/global.md#_Global) _(class)_
- [`TargetImpl`](modules/global.md#TargetImpl) _(type, type-only)_
- [`GlobalUtils`](modules/global.md#GlobalUtils) _(class)_

### html/managers

- [`TState`](modules/html-managers.md#TState) _(type, type-only)_

### html/managers/hotkey

- [`HotkeyManager`](modules/html-managers-hotkey.md#HotkeyManager) _(class)_
- [`hotkey`](modules/html-managers-hotkey.md#hotkey) _(const)_
- [`THotkeyItem`](modules/html-managers-hotkey.md#THotkeyItem) _(type, type-only)_
- [`THotkeyCombo`](modules/html-managers-hotkey.md#THotkeyCombo) _(type, type-only)_
- [`THotkeyEvent`](modules/html-managers-hotkey.md#THotkeyEvent) _(type, type-only)_
- [`THotkeyElementValidator`](modules/html-managers-hotkey.md#THotkeyElementValidator) _(type, type-only)_
- [`THotkeyMatchData`](modules/html-managers-hotkey.md#THotkeyMatchData) _(type, type-only)_
- [`THotkeyData`](modules/html-managers-hotkey.md#THotkeyData) _(type, type-only)_

### html/managers/keyboard

- [`KeyboardManager`](modules/html-managers-keyboard.md#KeyboardManager) _(class)_
- [`keyboardManager`](modules/html-managers-keyboard.md#keyboardManager) _(const)_
- [`TDirectionX`](modules/html-managers-keyboard.md#TDirectionX) _(type, type-only)_
- [`TDirectionY`](modules/html-managers-keyboard.md#TDirectionY) _(type, type-only)_
- [`TDirections`](modules/html-managers-keyboard.md#TDirections) _(type, type-only)_
- [`TModifierKeys`](modules/html-managers-keyboard.md#TModifierKeys) _(type, type-only)_
- [`TNumPadMathKeys`](modules/html-managers-keyboard.md#TNumPadMathKeys) _(type, type-only)_
- [`TWordKeys`](modules/html-managers-keyboard.md#TWordKeys) _(type, type-only)_
- [`TFnKeysCode`](modules/html-managers-keyboard.md#TFnKeysCode) _(type, type-only)_
- [`TWordKeysCode`](modules/html-managers-keyboard.md#TWordKeysCode) _(type, type-only)_
- [`TDigitKeysCode`](modules/html-managers-keyboard.md#TDigitKeysCode) _(type, type-only)_
- [`TModifierKeysCode`](modules/html-managers-keyboard.md#TModifierKeysCode) _(type, type-only)_
- [`TNumPadKeysCode`](modules/html-managers-keyboard.md#TNumPadKeysCode) _(type, type-only)_
- [`TArrowKeysCode`](modules/html-managers-keyboard.md#TArrowKeysCode) _(type, type-only)_
- [`TSpecialKeysCode`](modules/html-managers-keyboard.md#TSpecialKeysCode) _(type, type-only)_
- [`TKeyboardEventCode`](modules/html-managers-keyboard.md#TKeyboardEventCode) _(type, type-only)_
- [`TKeyboardOnEvent`](modules/html-managers-keyboard.md#TKeyboardOnEvent) _(type, type-only)_
- [`TKeyboardState`](modules/html-managers-keyboard.md#TKeyboardState) _(type, type-only)_
- [`TKeyboardValue`](modules/html-managers-keyboard.md#TKeyboardValue) _(type, type-only)_

### html/managers/mouse

- [`MOUSE_BUTTON_MAP`](modules/html-managers-mouse.md#MOUSE_BUTTON_MAP) _(const)_
- [`MouseManager`](modules/html-managers-mouse.md#MouseManager) _(class)_
- [`mouseManager`](modules/html-managers-mouse.md#mouseManager) _(const)_
- [`TMouseButtonMap`](modules/html-managers-mouse.md#TMouseButtonMap) _(type, type-only)_
- [`TMouseButtonsCode`](modules/html-managers-mouse.md#TMouseButtonsCode) _(type, type-only)_
- [`TMouseButtons`](modules/html-managers-mouse.md#TMouseButtons) _(type, type-only)_
- [`TMouseCoord`](modules/html-managers-mouse.md#TMouseCoord) _(type, type-only)_
- [`TMouseOnEvent`](modules/html-managers-mouse.md#TMouseOnEvent) _(type, type-only)_
- [`TMouseValue`](modules/html-managers-mouse.md#TMouseValue) _(type, type-only)_
- [`TMouseState`](modules/html-managers-mouse.md#TMouseState) _(type, type-only)_

### html/managers/theme

- [`STORAGE_KEY`](modules/html-managers-theme.md#STORAGE_KEY) _(const)_
- [`getSystemTheme`](modules/html-managers-theme.md#getSystemTheme) _(function)_
- [`getStoredTheme`](modules/html-managers-theme.md#getStoredTheme) _(function)_
- [`ThemeManager`](modules/html-managers-theme.md#ThemeManager) _(class)_
- [`themeManager`](modules/html-managers-theme.md#themeManager) _(const)_
- [`TTheme`](modules/html-managers-theme.md#TTheme) _(type, type-only)_
- [`TThemeOnEvent`](modules/html-managers-theme.md#TThemeOnEvent) _(type, type-only)_

### html/plugins

- [`TPlugin`](modules/html-plugins.md#TPlugin) _(interface, type-only)_

### html/plugins/async-check

- [`AsyncCheckPlugin`](modules/html-plugins-async-check.md#AsyncCheckPlugin) _(class)_
- [`TAsyncCheckState`](modules/html-plugins-async-check.md#TAsyncCheckState) _(type, type-only)_
- [`TAsyncCheckFn`](modules/html-plugins-async-check.md#TAsyncCheckFn) _(type, type-only)_

### html/plugins/date

- [`DatePlugin`](modules/html-plugins-date.md#DatePlugin) _(class)_
- [`TDateParseFn`](modules/html-plugins-date.md#TDateParseFn) _(type, type-only)_
- [`TDatePluginOptions`](modules/html-plugins-date.md#TDatePluginOptions) _(interface, type-only)_

### html/plugins/interaction

- [`InteractionPlugin`](modules/html-plugins-interaction.md#InteractionPlugin) _(class)_
- [`TInteractionState`](modules/html-plugins-interaction.md#TInteractionState) _(type, type-only)_

### html/plugins/mask

- [`MaskPlugin`](modules/html-plugins-mask.md#MaskPlugin) _(class)_

### html/plugins/number

- [`NumberPlugin`](modules/html-plugins-number.md#NumberPlugin) _(class)_
- [`TNumberPluginOptions`](modules/html-plugins-number.md#TNumberPluginOptions) _(interface, type-only)_

### html/plugins/registry

- [`TYPE_PLUGIN_FACTORY`](modules/html-plugins-registry.md#TYPE_PLUGIN_FACTORY) _(const)_
- [`TTypePluginFactory`](modules/html-plugins-registry.md#TTypePluginFactory) _(type, type-only)_
- [`TTypePluginName`](modules/html-plugins-registry.md#TTypePluginName) _(type, type-only)_
- [`createTypePlugin`](modules/html-plugins-registry.md#createTypePlugin) _(function)_

### mask

- [`TMaskRule`](modules/mask.md#TMaskRule) _(type, type-only)_
- [`DEFAULT_MASK_RULES`](modules/mask.md#DEFAULT_MASK_RULES) _(const)_
- [`dynamicMaskRules`](modules/mask.md#dynamicMaskRules) _(const)_
- [`ruleSetVersion`](modules/mask.md#ruleSetVersion) _(const)_
- [`compileCache`](modules/mask.md#compileCache) _(const)_
- [`clearCompileCache`](modules/mask.md#clearCompileCache) _(function)_
- [`resolveMaskRule`](modules/mask.md#resolveMaskRule) _(function)_
- [`tokenFromRule`](modules/mask.md#tokenFromRule) _(function)_
- [`registerToken`](modules/mask.md#registerToken) _(function)_
- [`unregisterToken`](modules/mask.md#unregisterToken) _(function)_
- [`getTokenKeys`](modules/mask.md#getTokenKeys) _(function)_
- [`splitPatterns`](modules/mask.md#splitPatterns) _(function)_
- [`compilePattern`](modules/mask.md#compilePattern) _(function)_
- [`compile`](modules/mask.md#compile) _(function)_
- [`matchToken`](modules/mask.md#matchToken) _(function)_
- [`unapplyFromPattern`](modules/mask.md#unapplyFromPattern) _(function)_
- [`unapply`](modules/mask.md#unapply) _(function)_
- [`applyFromPattern`](modules/mask.md#applyFromPattern) _(function)_
- [`apply`](modules/mask.md#apply) _(function)_
- [`isValid`](modules/mask.md#isValid) _(function)_
- [`caretPositionAfterFormat`](modules/mask.md#caretPositionAfterFormat) _(function)_
- [`_Mask`](modules/mask.md#_Mask) _(const)_
- [`TUtilsMask`](modules/mask.md#TUtilsMask) _(type, type-only)_
- [`TMaskTokenKind`](modules/mask.md#TMaskTokenKind) _(type, type-only)_
- [`TMaskTokenMatcher`](modules/mask.md#TMaskTokenMatcher) _(type, type-only)_
- [`TMaskTokenRule`](modules/mask.md#TMaskTokenRule) _(type, type-only)_
- [`TMaskParserEntry`](modules/mask.md#TMaskParserEntry) _(type, type-only)_
- [`TMaskCompiledPattern`](modules/mask.md#TMaskCompiledPattern) _(type, type-only)_
- [`TMaskCompiled`](modules/mask.md#TMaskCompiled) _(type, type-only)_
- [`TMaskApplyOptions`](modules/mask.md#TMaskApplyOptions) _(type, type-only)_
- [`MaskUtils`](modules/mask.md#MaskUtils) _(class)_

### natives

- [`TAwaited`](modules/natives.md#TAwaited) _(type, type-only)_
- [`TNoInfer`](modules/natives.md#TNoInfer) _(type, type-only)_
- [`TNonNullable`](modules/natives.md#TNonNullable) _(type, type-only)_
- [`TExclude`](modules/natives.md#TExclude) _(type, type-only)_
- [`TExtract`](modules/natives.md#TExtract) _(type, type-only)_

### natives/array

- [`_Array`](modules/natives-array.md#_Array) _(class)_
- [`TArray`](modules/natives-array.md#TArray) _(type, type-only)_
- [`TArrayLike`](modules/natives-array.md#TArrayLike) _(type, type-only)_
- [`TExtractValues`](modules/natives-array.md#TExtractValues) _(type, type-only)_
- [`TArrayType`](modules/natives-array.md#TArrayType) _(type, type-only)_
- [`TValueOf`](modules/natives-array.md#TValueOf) _(type, type-only)_
- [`TArrayOptions`](modules/natives-array.md#TArrayOptions) _(type, type-only)_
- [`TArrayRest`](modules/natives-array.md#TArrayRest) _(type, type-only)_
- [`TArrayOf`](modules/natives-array.md#TArrayOf) _(type, type-only)_
- [`TPair`](modules/natives-array.md#TPair) _(type, type-only)_
- [`TAsArray`](modules/natives-array.md#TAsArray) _(type, type-only)_
- [`TReverseArray`](modules/natives-array.md#TReverseArray) _(type, type-only)_
- [`ArrayUtils`](modules/natives-array.md#ArrayUtils) _(class)_

### natives/class

- [`Timeout`](modules/natives-class.md#Timeout) _(type)_
- [`Timeout`](modules/natives-class.md#Timeout) _(const)_
- [`_Class`](modules/natives-class.md#_Class) _(class)_
- [`instanceOf`](modules/natives-class.md#instanceOf) _(function)_
- [`TPrototype`](modules/natives-class.md#TPrototype) _(type, type-only)_
- [`TClazz`](modules/natives-class.md#TClazz) _(type, type-only)_
- [`TExtendClass`](modules/natives-class.md#TExtendClass) _(type, type-only)_
- [`TTimeout`](modules/natives-class.md#TTimeout) _(type, type-only)_
- [`ClassUtils`](modules/natives-class.md#ClassUtils) _(class)_

### natives/date

- [`_Date`](modules/natives-date.md#_Date) _(class)_
- [`parseISO`](modules/natives-date.md#parseISO) _(const)_
- [`DateUtils`](modules/natives-date.md#DateUtils) _(class)_

### natives/function

- [`_Function`](modules/natives-function.md#_Function) _(class)_
- [`TFnOption`](modules/natives-function.md#TFnOption) _(type, type-only)_
- [`TFn`](modules/natives-function.md#TFn) _(type, type-only)_
- [`TFnDeclaration`](modules/natives-function.md#TFnDeclaration) _(type, type-only)_
- [`R`](modules/natives-function.md#R) _(type, type-only)_
- [`R2`](modules/natives-function.md#R2) _(type, type-only)_
- [`TBindFnOption`](modules/natives-function.md#TBindFnOption) _(type, type-only)_
- [`TBindFn`](modules/natives-function.md#TBindFn) _(type, type-only)_
- [`TModifyFnParameters`](modules/natives-function.md#TModifyFnParameters) _(type, type-only)_
- [`TModifyFnReturn`](modules/natives-function.md#TModifyFnReturn) _(type, type-only)_
- [`TParameters`](modules/natives-function.md#TParameters) _(type, type-only)_
- [`TReturnType`](modules/natives-function.md#TReturnType) _(type, type-only)_
- [`TConstructor`](modules/natives-function.md#TConstructor) _(type, type-only)_
- [`TConstructorInfo`](modules/natives-function.md#TConstructorInfo) _(type, type-only)_
- [`TConstructorParameters`](modules/natives-function.md#TConstructorParameters) _(type, type-only)_
- [`TInstanceType`](modules/natives-function.md#TInstanceType) _(type, type-only)_

### natives/math

- [`_Math`](modules/natives-math.md#_Math) _(class)_
- [`IDigitSum`](modules/natives-math.md#IDigitSum) _(type, type-only)_
- [`IDigitSubtract`](modules/natives-math.md#IDigitSubtract) _(type, type-only)_
- [`MathUtils`](modules/natives-math.md#MathUtils) _(class)_

### natives/number

- [`_Number`](modules/natives-number.md#_Number) _(class)_
- [`TDigit`](modules/natives-number.md#TDigit) _(type, type-only)_
- [`TNumberTypes`](modules/natives-number.md#TNumberTypes) _(type, type-only)_
- [`TNumber`](modules/natives-number.md#TNumber) _(type, type-only)_
- [`TAbs`](modules/natives-number.md#TAbs) _(type, type-only)_
- [`TNegative`](modules/natives-number.md#TNegative) _(type, type-only)_
- [`TPositive`](modules/natives-number.md#TPositive) _(type, type-only)_
- [`TNegate`](modules/natives-number.md#TNegate) _(type, type-only)_
- [`TDigitCompare`](modules/natives-number.md#TDigitCompare) _(type, type-only)_
- [`NumberUtils`](modules/natives-number.md#NumberUtils) _(class)_

### natives/object

- [`_Object`](modules/natives-object.md#_Object) _(class)_
- [`isNull`](modules/natives-object.md#isNull) _(function)_
- [`isNullOrUndefined`](modules/natives-object.md#isNullOrUndefined) _(function)_
- [`json`](modules/natives-object.md#json) _(function)_
- [`TRequired`](modules/natives-object.md#TRequired) _(type, type-only)_
- [`TReadonly`](modules/natives-object.md#TReadonly) _(type, type-only)_
- [`TPick`](modules/natives-object.md#TPick) _(type, type-only)_
- [`TOmit`](modules/natives-object.md#TOmit) _(type, type-only)_
- [`TPartial`](modules/natives-object.md#TPartial) _(type, type-only)_
- [`TObject`](modules/natives-object.md#TObject) _(type, type-only)_
- [`TRecord`](modules/natives-object.md#TRecord) _(type, type-only)_
- [`TDeepPartial`](modules/natives-object.md#TDeepPartial) _(type, type-only)_
- [`TCommonFields`](modules/natives-object.md#TCommonFields) _(type, type-only)_
- [`TPath`](modules/natives-object.md#TPath) _(type, type-only)_
- [`TPathResolver`](modules/natives-object.md#TPathResolver) _(type, type-only)_
- [`TEntriesReturn`](modules/natives-object.md#TEntriesReturn) _(type, type-only)_
- [`TKeyOfOptions`](modules/natives-object.md#TKeyOfOptions) _(type, type-only)_
- [`TKeyOf`](modules/natives-object.md#TKeyOf) _(type, type-only)_
- [`TIterableKeys`](modules/natives-object.md#TIterableKeys) _(type, type-only)_
- [`Added`](modules/natives-object.md#Added) _(type, type-only)_
- [`Removed`](modules/natives-object.md#Removed) _(type, type-only)_
- [`Changed`](modules/natives-object.md#Changed) _(type, type-only)_
- [`TDiffs`](modules/natives-object.md#TDiffs) _(type, type-only)_
- [`ObjectUtils`](modules/natives-object.md#ObjectUtils) _(class)_

### natives/object/proxy

- [`isProxyKey`](modules/natives-object-proxy.md#isProxyKey) _(function)_
- [`getProxyKey`](modules/natives-object-proxy.md#getProxyKey) _(function)_
- [`isProxyEnabled`](modules/natives-object-proxy.md#isProxyEnabled) _(function)_
- [`createProxyProperty`](modules/natives-object-proxy.md#createProxyProperty) _(function)_
- [`get`](modules/natives-object-proxy.md#get) _(function)_
- [`set`](modules/natives-object-proxy.md#set) _(function)_
- [`defineProperty`](modules/natives-object-proxy.md#defineProperty) _(function)_
- [`deleteProperty`](modules/natives-object-proxy.md#deleteProperty) _(function)_
- [`proxyHandler`](modules/natives-object-proxy.md#proxyHandler) _(function)_
- [`deleteProxy`](modules/natives-object-proxy.md#deleteProxy) _(function)_
- [`TPropertyState`](modules/natives-object-proxy.md#TPropertyState) _(type, type-only)_
- [`TProperty`](modules/natives-object-proxy.md#TProperty) _(interface, type-only)_
- [`TProxyCallFunction`](modules/natives-object-proxy.md#TProxyCallFunction) _(type, type-only)_
- [`TProxyOptions`](modules/natives-object-proxy.md#TProxyOptions) _(type, type-only)_

### natives/string

- [`_String`](modules/natives-string.md#_String) _(class)_
- [`TReverseStr`](modules/natives-string.md#TReverseStr) _(type, type-only)_
- [`StringUtils`](modules/natives-string.md#StringUtils) _(class)_
- [`TUString`](modules/natives-string.md#TUString) _(type, type-only)_

### palette

- [`TONE_STOPS`](modules/palette.md#TONE_STOPS) _(const)_
- [`toHex`](modules/palette.md#toHex) _(function)_
- [`tone`](modules/palette.md#tone) _(function)_
- [`tonalPaletteRules`](modules/palette.md#tonalPaletteRules) _(const)_
- [`buildTonalPalette`](modules/palette.md#buildTonalPalette) _(const)_
- [`TToneStop`](modules/palette.md#TToneStop) _(type, type-only)_
- [`TTonalPalette`](modules/palette.md#TTonalPalette) _(type, type-only)_
- [`TTonalPaletteSeeds`](modules/palette.md#TTonalPaletteSeeds) _(type, type-only)_

### path-map

- [`PathMap`](modules/path-map.md#PathMap) _(class)_
- [`TRecursiveMap`](modules/path-map.md#TRecursiveMap) _(type, type-only)_

### rule-factory

- [`createFactory`](modules/rule-factory.md#createFactory) _(function)_
- [`TRuleContext`](modules/rule-factory.md#TRuleContext) _(type, type-only)_
- [`TSlotRule`](modules/rule-factory.md#TSlotRule) _(type, type-only)_
- [`TFactoryRules`](modules/rule-factory.md#TFactoryRules) _(type, type-only)_
- [`TFactoryResult`](modules/rule-factory.md#TFactoryResult) _(type, type-only)_

### spy

- [`_Spy`](modules/spy.md#_Spy) _(class)_
- [`SpyUtils`](modules/spy.md#SpyUtils) _(class)_

### time

- [`_Time`](modules/time.md#_Time) _(class)_
- [`TimeUtils`](modules/time.md#TimeUtils) _(class)_

### validation

- [`_Validation`](modules/validation.md#_Validation) _(class)_
- [`required`](modules/validation.md#required) _(function)_
- [`pattern`](modules/validation.md#pattern) _(function)_
- [`ValidationUtils`](modules/validation.md#ValidationUtils) _(class)_

### value-cell

- [`ValueCell`](modules/value-cell.md#ValueCell) _(class)_
- [`TValueCellListener`](modules/value-cell.md#TValueCellListener) _(type, type-only)_
- [`TValueCellUnsubscribe`](modules/value-cell.md#TValueCellUnsubscribe) _(type, type-only)_

### value-history

- [`ValueHistory`](modules/value-history.md#ValueHistory) _(class)_
- [`TIndexedItem`](modules/value-history.md#TIndexedItem) _(type, type-only)_
- [`TValueHistoryType`](modules/value-history.md#TValueHistoryType) _(type, type-only)_
- [`TValueHistoryState`](modules/value-history.md#TValueHistoryState) _(interface, type-only)_
- [`TNewValueHistoryState`](modules/value-history.md#TNewValueHistoryState) _(interface, type-only)_
- [`TValueHistoryCallBack`](modules/value-history.md#TValueHistoryCallBack) _(type, type-only)_
- [`TValueHistoryClearCallback`](modules/value-history.md#TValueHistoryClearCallback) _(type, type-only)_

### variant-cell

- [`VariantCell`](modules/variant-cell.md#VariantCell) _(class)_
- [`TVariantDerive`](modules/variant-cell.md#TVariantDerive) _(type, type-only)_
