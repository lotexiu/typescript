import Color from "colorjs.io";
import { ThemeUtils } from "./utils";

export const DefaultThemeBuilder = ThemeUtils.themeSchema(
  ["background", "foreground", "primary", "accent"],
  "background", // Cor base para algumas variações

  /* --- 1. Geração de Cores Principais (Foco em Fundo Escuro e Brilho) --- */
  {
    // --- Elementos de Fundo (Devem permanecer muito escuros)
    card: ({ background, foreground }) => new Color(background).mix(foreground, 0.12),
    popover: ({ background, foreground }) => new Color(background).mix(foreground, 0.08),
    // --- Cores Funcionais
		// Mix of 50% between primary and accent, with increased chroma
    secondary: ({ primary, accent }) => ThemeUtils.oppositeColor(new Color(primary).mix(accent, 0.5, { space: "lch" }), {s: 0.8}),
    destructive: ({ accent }) => new Color("red").mix(accent, 0.1, { space: "lch" }),
    // Muted: Little mix between background and accent for subtle highlights
    muted: ({ background, accent }) => new Color(background).mix(accent, 0.08, { space: "lch" }),
    // Used oppositeColor to ensure high luminosity (L) and high Saturation (S)
    border: ({ primary }) => ThemeUtils.oppositeColor(new Color(primary), {s:1, l:0.5}), // Brilhante
    input: ({ primary }) => ThemeUtils.oppositeColor(new Color(primary), {s:0.9, l:0.4}), // Levemente mais escuro que a borda
    ring: ({ accent }) => ThemeUtils.oppositeColor(new Color(accent), {s:1, l:0.5}),

    // --- Charts (Derivadas de cores neon ou misturas)
		"chart-1": ({ background }) => new Color("#003f5c").mix(background, 0.3, { space: "lch" }),
		"chart-2": ({ background }) => new Color("#444e86").mix(background, 0.3, { space: "lch" }),
		"chart-3": ({ background }) => new Color("#955196").mix(background, 0.3, { space: "lch" }),
		"chart-4": ({ background }) => new Color("#dd5182").mix(background, 0.3, { space: "lch" }),
		"chart-5": ({ background }) => new Color("#ff6e54").mix(background, 0.3, { space: "lch" }),
		"chart-6": ({ background }) => new Color("#ffa600").mix(background, 0.3, { space: "lch" }),

    // --- Sidebar (Praticamente a cor do background para a sensação de profundidade)
    sidebar: ({ background, foreground }) => new Color(background).mix(foreground, 0.035, { space: "lch" }),
    sidebarPrimary: ({ primary, background }) => new Color(background).mix(primary, 0.16, { space: "lch" }),
    sidebarAccent: ({ accent, background }) => new Color(background).mix(accent, 0.16, { space: "lch" }),
    sidebarBorder: ({ background, foreground }) => new Color(background).mix(foreground, 0.07, { space: "lch" }),
    sidebarRing: ({ accent, background }) => new Color(accent).mix(background, 0.2, { space: "lch" }),

    // --- Base
    error: ({ accent }) => new Color("red").mix(accent, 0.12, { space: "lch" }), //.set({ "lch.l": 75 }),
    warning: ({ accent }) => new Color("orange").mix(accent, 0.12, { space: "lch" }), //.set({ "lch.l": 75 }),
    success: ({ accent }) => new Color("lime").mix(accent, 0.15, { space: "lch" }), //.set({ "lch.l": 75 }),
  },
  /* --- 2. Geração de Cores Foreground (Usa ThemeUtils.oppositeColor para o contraste) --- */
  {
    // A maioria dos foregounds serão gerados para ter contraste máximo
    cardForeground: ({ card }) => ThemeUtils.oppositeColor(card, {l:'fullRange', s:"minRange"}),
    popoverForeground: ({ popover }) => ThemeUtils.oppositeColor(popover, {l:'fullRange', s:"minRange"}),
    primaryForeground: ({ primary }) => ThemeUtils.oppositeColor(primary, {l:'fullRange', s:"minRange"}),
    secondaryForeground: ({ secondary }) => ThemeUtils.oppositeColor(secondary, {l:'fullRange', s:"minRange"}),
    mutedForeground: ({ muted }) => ThemeUtils.oppositeColor(muted, {l:'medium', s: "minRange" }),
    accentForeground: ({ accent }) => ThemeUtils.oppositeColor(accent, {l:'fullRange', s:"minRange"}),
    // Sidebar: Foreground será a cor primária brilhante
    sidebarForeground: ({ primary }) => ThemeUtils.oppositeColor(primary, {l:'fullRange', s:"minRange"}),
    sidebarPrimaryForeground: ({ sidebarPrimary }) => ThemeUtils.oppositeColor(sidebarPrimary, {l:'fullRange', s:"minRange"}),
    sidebarAccentForeground: ({ sidebarAccent }) => ThemeUtils.oppositeColor(sidebarAccent, {l:'fullRange', s:"minRange"}),
  },
  /* --- 3. Validação (Mantida para garantir WCAG) --- */
  (theme) => {
    theme.getVariations.forEach((key) => {
      const fontKey = `${key}Foreground`;
      if (fontKey in theme) {
        const contrast = theme[key].contrast((theme as any)[fontKey], "WCAG21");
        if (contrast < 4.5) {
          console.error(
            `[WCAG21][VARIATION] Insufficient contrast (${contrast.toFixed(2)}). Minimum is 4.5 between '${key}' and '${fontKey}'. ${theme[key].toString()} vs ${(theme as any)[fontKey].toString()}`,
          );
          return;
        }
        if (contrast < 7) {
          console.warn(
            `[WCAG21][FONT] Low contrast (${contrast.toFixed(2)}). Recommended to be above 7 between '${key}' and '${fontKey}'. ${theme[key].toString()} vs ${(theme as any)[fontKey].toString()}`,
          );
          return;
        }
      }
    });
  },
);
