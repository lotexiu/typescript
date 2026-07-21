[← Voltar para PROJECT.md](../PROJECT.md)

# html/managers/theme

<a id="STORAGE_KEY"></a>
#### [`STORAGE_KEY`](../../src/html/managers/theme/model.ts#L4) _(const)_

<a id="getSystemTheme"></a>
#### [`getSystemTheme`](../../src/html/managers/theme/model.ts#L6) _(function)_

<a id="getStoredTheme"></a>
#### [`getStoredTheme`](../../src/html/managers/theme/model.ts#L10) _(function)_

<a id="ThemeManager"></a>
#### [`ThemeManager`](../../src/html/managers/theme/model.ts#L24) _(class)_

ThemeManager
Fonte única de verdade pro tema atual (light/dark): parte da escolha
manual salva ou, na ausência dela, da preferência do sistema. Só escuta
mudança de preferência do SO enquanto houver assinante — mesmo ciclo de
vida de keyboardManager/mouseManager, via CaptureManager. Não gera
paleta/tokens de cor (isso é uma camada futura, ainda não construída);
este primeiro passo só resolve claro/escuro + persistência.

<a id="ThemeManager.start"></a>
- [`start`](../../src/html/managers/theme/model.ts#L38)
  Starts listening for OS light/dark preference changes.
<a id="ThemeManager.stop"></a>
- [`stop`](../../src/html/managers/theme/model.ts#L44)
  Stops listening for OS preference changes.
<a id="ThemeManager.lastId"></a>
- [`lastId`](../../src/html/managers/theme/model.ts#L49)
  Next id to hand out for a registered callback.
<a id="ThemeManager.register"></a>
- [`register`](../../src/html/managers/theme/model.ts#L51)
  Registers `value` under a fresh numeric id.
<a id="ThemeManager.unRegister"></a>
- [`unRegister`](../../src/html/managers/theme/model.ts#L58)
  Unregisters the callback with `id`.
<a id="ThemeManager.setTheme"></a>
- [`setTheme`](../../src/html/managers/theme/model.ts#L74)
  Escolha explícita do usuário: persiste e notifica.
<a id="ThemeManager.toggle"></a>
- [`toggle`](../../src/html/managers/theme/model.ts#L80)
  Switches between `light` and `dark`.

<a id="themeManager"></a>
#### [`themeManager`](../../src/html/managers/theme/model.ts#L86) _(const)_

Singleton `CaptureManager` for the current light/dark theme — a manual choice persisted in `localStorage`, falling back to the OS preference; tracks OS changes live only while someone subscribes via `add()`.

<a id="TTheme"></a>
#### [`TTheme`](../../src/html/managers/theme/types.ts#L2) _(type, type-only)_

The two themes `themeManager` recognizes.

<a id="TThemeOnEvent"></a>
#### [`TThemeOnEvent`](../../src/html/managers/theme/types.ts#L5) _(type, type-only)_

Listener signature `themeManager.add(...)` accepts.
