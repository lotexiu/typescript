[← Voltar para PROJECT.md](../PROJECT.md)

# html/managers/theme

<a id="STORAGE_KEY"></a>
#### [`STORAGE_KEY`](../../src/html/managers/theme/model.ts#L4) _(const)_

<a id="getSystemTheme"></a>
#### [`getSystemTheme`](../../src/html/managers/theme/model.ts#L6) _(function)_

<a id="getStoredTheme"></a>
#### [`getStoredTheme`](../../src/html/managers/theme/model.ts#L10) _(function)_

<a id="stored"></a>
#### [`stored`](../../src/html/managers/theme/model.ts#L11) _(const)_

<a id="ThemeManager"></a>
#### [`ThemeManager`](../../src/html/managers/theme/model.ts#L24) _(class)_

ThemeManager
Fonte única de verdade pro tema atual (light/dark): parte da escolha
manual salva ou, na ausência dela, da preferência do sistema. Só escuta
mudança de preferência do SO enquanto houver assinante — mesmo ciclo de
vida de keyboardManager/mouseManager, via CaptureManager. Não gera
paleta/tokens de cor (isso é uma camada futura, ainda não construída);
este primeiro passo só resolve claro/escuro + persistência.

<a id="id"></a>
#### [`id`](../../src/html/managers/theme/model.ts#L48) _(const)_

<a id="themeManager"></a>
#### [`themeManager`](../../src/html/managers/theme/model.ts#L80) _(const)_

Singleton `CaptureManager` for the current light/dark theme — a manual choice persisted in `localStorage`, falling back to the OS preference; tracks OS changes live only while someone subscribes via `add()`.

<a id="TTheme"></a>
#### [`TTheme`](../../src/html/managers/theme/types.ts#L2) _(type, type-only)_

The two themes `themeManager` recognizes.

<a id="TThemeOnEvent"></a>
#### [`TThemeOnEvent`](../../src/html/managers/theme/types.ts#L5) _(type, type-only)_

Listener signature `themeManager.add(...)` accepts.
