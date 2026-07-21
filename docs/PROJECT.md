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
- [`TUnionToIntersection`](modules/root.md#TUnionToIntersection) _(type, type-only)_
- [`TLastOf`](modules/root.md#TLastOf) _(type, type-only)_
- [`TUnionToList`](modules/root.md#TUnionToList) _(type, type-only)_
- [`Test`](modules/root.md#Test) _(type, type-only)_
- [`R`](modules/root.md#R) _(type, type-only)_

### capture-manager

- [`CaptureManager`](modules/capture-manager.md#CaptureManager) _(class)_
- [`newValue`](modules/capture-manager.md#newValue) _(const)_
- [`id`](modules/capture-manager.md#id) _(const)_
- [`value`](modules/capture-manager.md#value) _(const)_

### filters

- [`DEFAULT_DEBOUNCE_DURATION`](modules/filters.md#DEFAULT_DEBOUNCE_DURATION) _(const)_
- [`DEFAULT_THROTTLE_INTERVAL`](modules/filters.md#DEFAULT_THROTTLE_INTERVAL) _(const)_
- [`DEFAULT_STEP_AMOUNT`](modules/filters.md#DEFAULT_STEP_AMOUNT) _(const)_
- [`debounce`](modules/filters.md#debounce) _(function)_
- [`timeoutId`](modules/filters.md#timeoutId) _(const)_
- [`handler`](modules/filters.md#handler) _(function)_
- [`throttle`](modules/filters.md#throttle) _(function)_
- [`lastTime`](modules/filters.md#lastTime) _(const)_
- [`handler`](modules/filters.md#handler) _(function)_
- [`now`](modules/filters.md#now) _(const)_
- [`step`](modules/filters.md#step) _(function)_
- [`counter`](modules/filters.md#counter) _(const)_
- [`handler`](modules/filters.md#handler) _(function)_
- [`once`](modules/filters.md#once) _(function)_
- [`runned`](modules/filters.md#runned) _(const)_
- [`handler`](modules/filters.md#handler) _(function)_
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
- [`combo`](modules/html-managers-hotkey.md#combo) _(const)_
- [`bindings`](modules/html-managers-hotkey.md#bindings) _(const)_
- [`index`](modules/html-managers-hotkey.md#index) _(const)_
- [`value`](modules/html-managers-hotkey.md#value) _(const)_
- [`value`](modules/html-managers-hotkey.md#value) _(const)_
- [`datas`](modules/html-managers-hotkey.md#datas) _(const)_
- [`lowestDistance`](modules/html-managers-hotkey.md#lowestDistance) _(const)_
- [`activeHotkeys`](modules/html-managers-hotkey.md#activeHotkeys) _(const)_
- [`distance`](modules/html-managers-hotkey.md#distance) _(const)_
- [`distance`](modules/html-managers-hotkey.md#distance) _(const)_
- [`hotkey`](modules/html-managers-hotkey.md#hotkey) _(const)_
- [`THotkeyItem`](modules/html-managers-hotkey.md#THotkeyItem) _(type, type-only)_
- [`THotkeyCombo`](modules/html-managers-hotkey.md#THotkeyCombo) _(type, type-only)_
- [`THotkeyEvent`](modules/html-managers-hotkey.md#THotkeyEvent) _(type, type-only)_
- [`THotkeyElementValidator`](modules/html-managers-hotkey.md#THotkeyElementValidator) _(type, type-only)_
- [`THotkeyMatchData`](modules/html-managers-hotkey.md#THotkeyMatchData) _(type, type-only)_
- [`THotkeyData`](modules/html-managers-hotkey.md#THotkeyData) _(type, type-only)_

### html/managers/keyboard

- [`KeyboardManager`](modules/html-managers-keyboard.md#KeyboardManager) _(class)_
- [`id`](modules/html-managers-keyboard.md#id) _(const)_
- [`value`](modules/html-managers-keyboard.md#value) _(const)_
- [`key`](modules/html-managers-keyboard.md#key) _(const)_
- [`pressed`](modules/html-managers-keyboard.md#pressed) _(const)_
- [`nextPressed`](modules/html-managers-keyboard.md#nextPressed) _(const)_
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
- [`id`](modules/html-managers-mouse.md#id) _(const)_
- [`value`](modules/html-managers-mouse.md#value) _(const)_
- [`result`](modules/html-managers-mouse.md#result) _(const)_
- [`moveEvent`](modules/html-managers-mouse.md#moveEvent) _(const)_
- [`button`](modules/html-managers-mouse.md#button) _(const)_
- [`isDown`](modules/html-managers-mouse.md#isDown) _(const)_
- [`nextButtons`](modules/html-managers-mouse.md#nextButtons) _(const)_
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
- [`stored`](modules/html-managers-theme.md#stored) _(const)_
- [`ThemeManager`](modules/html-managers-theme.md#ThemeManager) _(class)_
- [`id`](modules/html-managers-theme.md#id) _(const)_
- [`themeManager`](modules/html-managers-theme.md#themeManager) _(const)_
- [`TTheme`](modules/html-managers-theme.md#TTheme) _(type, type-only)_
- [`TThemeOnEvent`](modules/html-managers-theme.md#TThemeOnEvent) _(type, type-only)_

### html/plugins

- [`TPlugin`](modules/html-plugins.md#TPlugin) _(interface, type-only)_

### html/plugins/async-check

- [`AsyncCheckPlugin`](modules/html-plugins-async-check.md#AsyncCheckPlugin) _(class)_
- [`token`](modules/html-plugins-async-check.md#token) _(const)_
- [`result`](modules/html-plugins-async-check.md#result) _(const)_
- [`TAsyncCheckState`](modules/html-plugins-async-check.md#TAsyncCheckState) _(type, type-only)_
- [`TAsyncCheckFn`](modules/html-plugins-async-check.md#TAsyncCheckFn) _(type, type-only)_

### html/plugins/date

- [`DatePlugin`](modules/html-plugins-date.md#DatePlugin) _(class)_
- [`TDateParseFn`](modules/html-plugins-date.md#TDateParseFn) _(type, type-only)_
- [`TDatePluginOptions`](modules/html-plugins-date.md#TDatePluginOptions) _(interface, type-only)_

### html/plugins/interaction

- [`InteractionPlugin`](modules/html-plugins-interaction.md#InteractionPlugin) _(class)_
- [`current`](modules/html-plugins-interaction.md#current) _(const)_
- [`next`](modules/html-plugins-interaction.md#next) _(const)_
- [`TInteractionState`](modules/html-plugins-interaction.md#TInteractionState) _(type, type-only)_

### html/plugins/mask

- [`MaskPlugin`](modules/html-plugins-mask.md#MaskPlugin) _(class)_

### html/plugins/number

- [`NumberPlugin`](modules/html-plugins-number.md#NumberPlugin) _(class)_
- [`parsed`](modules/html-plugins-number.md#parsed) _(const)_
- [`current`](modules/html-plugins-number.md#current) _(const)_
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
- [`keys`](modules/mask.md#keys) _(const)_
- [`splitPatterns`](modules/mask.md#splitPatterns) _(function)_
- [`patterns`](modules/mask.md#patterns) _(const)_
- [`current`](modules/mask.md#current) _(const)_
- [`escaped`](modules/mask.md#escaped) _(const)_
- [`char`](modules/mask.md#char) _(const)_
- [`compilePattern`](modules/mask.md#compilePattern) _(function)_
- [`entries`](modules/mask.md#entries) _(const)_
- [`escaped`](modules/mask.md#escaped) _(const)_
- [`char`](modules/mask.md#char) _(const)_
- [`rule`](modules/mask.md#rule) _(const)_
- [`min`](modules/mask.md#min) _(const)_
- [`max`](modules/mask.md#max) _(const)_
- [`nextChar`](modules/mask.md#nextChar) _(const)_
- [`closeIndex`](modules/mask.md#closeIndex) _(const)_
- [`body`](modules/mask.md#body) _(const)_
- [`parts`](modules/mask.md#parts) _(const)_
- [`token`](modules/mask.md#token) _(const)_
- [`compile`](modules/mask.md#compile) _(function)_
- [`cacheKey`](modules/mask.md#cacheKey) _(const)_
- [`cached`](modules/mask.md#cached) _(const)_
- [`compiled`](modules/mask.md#compiled) _(const)_
- [`matchToken`](modules/mask.md#matchToken) _(function)_
- [`rule`](modules/mask.md#rule) _(const)_
- [`unapplyFromPattern`](modules/mask.md#unapplyFromPattern) _(function)_
- [`tokenEntries`](modules/mask.md#tokenEntries) _(const)_
- [`tokenIndex`](modules/mask.md#tokenIndex) _(const)_
- [`currentTokenCount`](modules/mask.md#currentTokenCount) _(const)_
- [`raw`](modules/mask.md#raw) _(const)_
- [`token`](modules/mask.md#token) _(const)_
- [`unapply`](modules/mask.md#unapply) _(function)_
- [`compiled`](modules/mask.md#compiled) _(const)_
- [`bestRaw`](modules/mask.md#bestRaw) _(const)_
- [`candidateRaw`](modules/mask.md#candidateRaw) _(const)_
- [`applyFromPattern`](modules/mask.md#applyFromPattern) _(function)_
- [`output`](modules/mask.md#output) _(const)_
- [`lastTokenOutputEnd`](modules/mask.md#lastTokenOutputEnd) _(const)_
- [`rawIndex`](modules/mask.md#rawIndex) _(const)_
- [`consumedTokens`](modules/mask.md#consumedTokens) _(const)_
- [`requiredConsumedTokens`](modules/mask.md#requiredConsumedTokens) _(const)_
- [`patternFullySatisfied`](modules/mask.md#patternFullySatisfied) _(const)_
- [`matchedForEntry`](modules/mask.md#matchedForEntry) _(const)_
- [`foundIndex`](modules/mask.md#foundIndex) _(const)_
- [`valid`](modules/mask.md#valid) _(const)_
- [`apply`](modules/mask.md#apply) _(function)_
- [`compiled`](modules/mask.md#compiled) _(const)_
- [`rawValue`](modules/mask.md#rawValue) _(const)_
- [`applyWhenValid`](modules/mask.md#applyWhenValid) _(const)_
- [`bestValue`](modules/mask.md#bestValue) _(const)_
- [`bestScore`](modules/mask.md#bestScore) _(const)_
- [`result`](modules/mask.md#result) _(const)_
- [`score`](modules/mask.md#score) _(const)_
- [`isValid`](modules/mask.md#isValid) _(function)_
- [`compiled`](modules/mask.md#compiled) _(const)_
- [`rawValue`](modules/mask.md#rawValue) _(const)_
- [`isPatternValidForMaskedValue`](modules/mask.md#isPatternValidForMaskedValue) _(const)_
- [`valueIndex`](modules/mask.md#valueIndex) _(const)_
- [`matchedForEntry`](modules/mask.md#matchedForEntry) _(const)_
- [`isPatternValidForRawValue`](modules/mask.md#isPatternValidForRawValue) _(const)_
- [`tokenEntries`](modules/mask.md#tokenEntries) _(const)_
- [`rawIndex`](modules/mask.md#rawIndex) _(const)_
- [`matchedForEntry`](modules/mask.md#matchedForEntry) _(const)_
- [`caretPositionAfterFormat`](modules/mask.md#caretPositionAfterFormat) _(function)_
- [`compiled`](modules/mask.md#compiled) _(const)_
- [`target`](modules/mask.md#target) _(const)_
- [`index`](modules/mask.md#index) _(const)_
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
- [`instanceOf`](modules/natives-class.md#instanceOf) _(function)_
- [`TPrototype`](modules/natives-class.md#TPrototype) _(type, type-only)_
- [`TClazz`](modules/natives-class.md#TClazz) _(type, type-only)_
- [`TExtendClass`](modules/natives-class.md#TExtendClass) _(type, type-only)_
- [`TTimeout`](modules/natives-class.md#TTimeout) _(type, type-only)_

### natives/date

- [`_Date`](modules/natives-date.md#_Date) _(class)_
- [`trimmed`](modules/natives-date.md#trimmed) _(const)_
- [`match`](modules/natives-date.md#match) _(const)_
- [`year`](modules/natives-date.md#year) _(const)_
- [`month`](modules/natives-date.md#month) _(const)_
- [`day`](modules/natives-date.md#day) _(const)_
- [`date`](modules/natives-date.md#date) _(const)_
- [`isRealCalendarDate`](modules/natives-date.md#isRealCalendarDate) _(const)_
- [`parseISO`](modules/natives-date.md#parseISO) _(const)_
- [`DateUtils`](modules/natives-date.md#DateUtils) _(class)_

### natives/function

- [`_Function`](modules/natives-function.md#_Function) _(class)_
- [`newFn`](modules/natives-function.md#newFn) _(function)_
- [`originalFn`](modules/natives-function.md#originalFn) _(const)_
- [`boundArgs`](modules/natives-function.md#boundArgs) _(const)_
- [`newFn`](modules/natives-function.md#newFn) _(function)_
- [`TUFunction`](modules/natives-function.md#TUFunction) _(type, type-only)_
- [`TFnOption`](modules/natives-function.md#TFnOption) _(type, type-only)_
- [`TFn`](modules/natives-function.md#TFn) _(type, type-only)_
- [`TFnDeclaration`](modules/natives-function.md#TFnDeclaration) _(type, type-only)_
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
- [`result`](modules/natives-math.md#result) _(const)_
- [`clamp`](modules/natives-math.md#clamp) _(const)_
- [`IDigitSum`](modules/natives-math.md#IDigitSum) _(type, type-only)_
- [`IDigitSubtract`](modules/natives-math.md#IDigitSubtract) _(type, type-only)_
- [`MathUtils`](modules/natives-math.md#MathUtils) _(class)_

### natives/number

- [`_Number`](modules/natives-number.md#_Number) _(class)_
- [`parsed`](modules/natives-number.md#parsed) _(const)_
- [`parse`](modules/natives-number.md#parse) _(const)_
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
- [`keys`](modules/natives-object.md#keys) _(const)_
- [`seen`](modules/natives-object.md#seen) _(const)_
- [`result`](modules/natives-object.md#result) _(const)_
- [`keys`](modules/natives-object.md#keys) _(const)_
- [`aVal`](modules/natives-object.md#aVal) _(const)_
- [`bVal`](modules/natives-object.md#bVal) _(const)_
- [`path`](modules/natives-object.md#path) _(const)_
- [`isNull`](modules/natives-object.md#isNull) _(const)_
- [`isNullOrUndefined`](modules/natives-object.md#isNullOrUndefined) _(const)_
- [`json`](modules/natives-object.md#json) _(const)_
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
- [`proxyProperty`](modules/natives-object-proxy.md#proxyProperty) _(const)_
- [`explicitOptions`](modules/natives-object-proxy.md#explicitOptions) _(const)_
- [`nestedOptions`](modules/natives-object-proxy.md#nestedOptions) _(const)_
- [`get`](modules/natives-object-proxy.md#get) _(function)_
- [`value`](modules/natives-object-proxy.md#value) _(const)_
- [`descriptor`](modules/natives-object-proxy.md#descriptor) _(const)_
- [`isConfigurable`](modules/natives-object-proxy.md#isConfigurable) _(const)_
- [`bound`](modules/natives-object-proxy.md#bound) _(const)_
- [`returnedValue`](modules/natives-object-proxy.md#returnedValue) _(const)_
- [`set`](modules/natives-object-proxy.md#set) _(function)_
- [`previousValue`](modules/natives-object-proxy.md#previousValue) _(const)_
- [`defineProperty`](modules/natives-object-proxy.md#defineProperty) _(function)_
- [`previousValue`](modules/natives-object-proxy.md#previousValue) _(const)_
- [`deleteProperty`](modules/natives-object-proxy.md#deleteProperty) _(function)_
- [`previousValue`](modules/natives-object-proxy.md#previousValue) _(const)_
- [`proxyHandler`](modules/natives-object-proxy.md#proxyHandler) _(function)_
- [`proxy`](modules/natives-object-proxy.md#proxy) _(const)_
- [`deleteProxy`](modules/natives-object-proxy.md#deleteProxy) _(function)_
- [`TPropertyState`](modules/natives-object-proxy.md#TPropertyState) _(type, type-only)_
- [`TProperty`](modules/natives-object-proxy.md#TProperty) _(interface, type-only)_
- [`TProxyCallFunction`](modules/natives-object-proxy.md#TProxyCallFunction) _(type, type-only)_
- [`TProxyOptions`](modules/natives-object-proxy.md#TProxyOptions) _(type, type-only)_

### natives/string

- [`_String`](modules/natives-string.md#_String) _(class)_
- [`index`](modules/natives-string.md#index) _(const)_
- [`TUString`](modules/natives-string.md#TUString) _(type, type-only)_
- [`TReverseStr`](modules/natives-string.md#TReverseStr) _(type, type-only)_
- [`StringUtils`](modules/natives-string.md#StringUtils) _(class)_

### natives/validation

- [`_Validation`](modules/natives-validation.md#_Validation) _(class)_
- [`digits`](modules/natives-validation.md#digits) _(const)_
- [`checkDigit`](modules/natives-validation.md#checkDigit) _(const)_
- [`sum`](modules/natives-validation.md#sum) _(const)_
- [`weightStart`](modules/natives-validation.md#weightStart) _(const)_
- [`remainder`](modules/natives-validation.md#remainder) _(const)_
- [`digits`](modules/natives-validation.md#digits) _(const)_
- [`checkDigit`](modules/natives-validation.md#checkDigit) _(const)_
- [`sum`](modules/natives-validation.md#sum) _(const)_
- [`remainder`](modules/natives-validation.md#remainder) _(const)_
- [`firstWeights`](modules/natives-validation.md#firstWeights) _(const)_
- [`secondWeights`](modules/natives-validation.md#secondWeights) _(const)_
- [`required`](modules/natives-validation.md#required) _(const)_
- [`pattern`](modules/natives-validation.md#pattern) _(const)_
- [`isValidCPF`](modules/natives-validation.md#isValidCPF) _(const)_
- [`isValidCNPJ`](modules/natives-validation.md#isValidCNPJ) _(const)_
- [`ValidationUtils`](modules/natives-validation.md#ValidationUtils) _(class)_

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
- [`last`](modules/path-map.md#last) _(const)_
- [`current`](modules/path-map.md#current) _(const)_
- [`stack`](modules/path-map.md#stack) _(const)_
- [`current`](modules/path-map.md#current) _(const)_
- [`values`](modules/path-map.md#values) _(const)_
- [`index`](modules/path-map.md#index) _(const)_
- [`{ parent, key }`](modules/path-map.md#{ parent, key }) _(const)_
- [`target`](modules/path-map.md#target) _(const)_
- [`isEmpty`](modules/path-map.md#isEmpty) _(const)_
- [`current`](modules/path-map.md#current) _(const)_
- [`TRecursiveMap`](modules/path-map.md#TRecursiveMap) _(type, type-only)_

### rule-factory

- [`createFactory`](modules/rule-factory.md#createFactory) _(function)_
- [`keys`](modules/rule-factory.md#keys) _(const)_
- [`values`](modules/rule-factory.md#values) _(const)_
- [`resolved`](modules/rule-factory.md#resolved) _(const)_
- [`get`](modules/rule-factory.md#get) _(function)_
- [`suggestions`](modules/rule-factory.md#suggestions) _(const)_
- [`suggested`](modules/rule-factory.md#suggested) _(const)_
- [`TRuleContext`](modules/rule-factory.md#TRuleContext) _(type, type-only)_
- [`TSlotRule`](modules/rule-factory.md#TSlotRule) _(type, type-only)_
- [`TFactoryRules`](modules/rule-factory.md#TFactoryRules) _(type, type-only)_
- [`TFactoryResult`](modules/rule-factory.md#TFactoryResult) _(type, type-only)_

### spy

- [`_Spy`](modules/spy.md#_Spy) _(class)_
- [`totalTime`](modules/spy.md#totalTime) _(const)_
- [`count`](modules/spy.md#count) _(const)_
- [`start`](modules/spy.md#start) _(const)_
- [`result`](modules/spy.md#result) _(const)_
- [`averageTime`](modules/spy.md#averageTime) _(const)_
- [`timeExecution`](modules/spy.md#timeExecution) _(const)_
- [`SpyUtils`](modules/spy.md#SpyUtils) _(class)_

### time

- [`_Time`](modules/time.md#_Time) _(class)_
- [`convert`](modules/time.md#convert) _(const)_
- [`TimeUtils`](modules/time.md#TimeUtils) _(class)_

### value-cell

- [`ValueCell`](modules/value-cell.md#ValueCell) _(class)_
- [`TValueCellListener`](modules/value-cell.md#TValueCellListener) _(type, type-only)_
- [`TValueCellUnsubscribe`](modules/value-cell.md#TValueCellUnsubscribe) _(type, type-only)_

### value-history

- [`ValueHistory`](modules/value-history.md#ValueHistory) _(class)_
- [`state`](modules/value-history.md#state) _(const)_
- [`state`](modules/value-history.md#state) _(const)_
- [`TIndexedItem`](modules/value-history.md#TIndexedItem) _(type, type-only)_
- [`TValueHistoryType`](modules/value-history.md#TValueHistoryType) _(type, type-only)_
- [`TValueHistoryState`](modules/value-history.md#TValueHistoryState) _(interface, type-only)_
- [`TNewValueHistoryState`](modules/value-history.md#TNewValueHistoryState) _(interface, type-only)_
- [`TValueHistoryCallBack`](modules/value-history.md#TValueHistoryCallBack) _(type, type-only)_
- [`TValueHistoryClearCallback`](modules/value-history.md#TValueHistoryClearCallback) _(type, type-only)_

### variant-cell

- [`VariantCell`](modules/variant-cell.md#VariantCell) _(class)_
- [`name`](modules/variant-cell.md#name) _(const)_
- [`cached`](modules/variant-cell.md#cached) _(const)_
- [`value`](modules/variant-cell.md#value) _(const)_
- [`TVariantDerive`](modules/variant-cell.md#TVariantDerive) _(type, type-only)_
