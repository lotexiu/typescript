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
    // Secondary: Mistura primária e accent, mas mantém a cor viva (alto croma)
    secondary: ({ primary, accent }) => new Color(primary).mix(accent, 0.5, { space: "lch" }).set("lch.c", c => c * 1.1),
    // Destructive: Vermelho puro e brilhante, contrastando com o fundo
    destructive: ({ background }) => new Color("red").mix(background, 0.15, { space: "lch" }),
    // Muted: Apenas uma leve variação do background
    muted: ({ background, foreground }) => new Color(background).mix(foreground, 0.12),
    // --- Efeito Neon (Cores que parecem brilhar no escuro)
    // Usamos LCH para garantir alta luminosidade (L) e alto croma (C)
    border: ({ primary }) => new Color(primary).set({ "lch.l": 60, "lch.c": 100 }), // Brilhante
    input: ({ primary }) => new Color(primary).set({ "lch.l": 50, "lch.c": 80 }), // Levemente mais escuro que a borda
    ring: ({ accent }) => new Color(accent).set({ "lch.l": 80, "lch.c": 120 }), // Super Brilhante

    // --- Charts (Derivadas de cores neon ou misturas)
		"chart-1": ({ background }) => new Color("#003f5c").mix(background, 0.3, { space: "lch" }),
		"chart-2": ({ background }) => new Color("#444e86").mix(background, 0.3, { space: "lch" }),
		"chart-3": ({ background }) => new Color("#955196").mix(background, 0.3, { space: "lch" }),
		"chart-4": ({ background }) => new Color("#dd5182").mix(background, 0.3, { space: "lch" }),
		"chart-5": ({ background }) => new Color("#ff6e54").mix(background, 0.3, { space: "lch" }),
		"chart-6": ({ background }) => new Color("#ffa600").mix(background, 0.3, { space: "lch" }),

    // --- Sidebar (Praticamente a cor do background para a sensação de profundidade)
    sidebar: ({ background, foreground }) => new Color(background).mix(foreground, 0.035),
    sidebarPrimary: ({ primary }) => new Color("black").set("lch.l", l => l + 5).mix(primary, 0.3),
    sidebarAccent: ({ accent }) => new Color("black").set("lch.l", l => l + 5).mix(accent, 0.3),
    sidebarBorder: ({ background }) => new Color(background).set("lch.l", l => l + 10),
    sidebarRing: ({ accent }) => new Color(accent).set({ "lch.l": 85 }),

    // --- Base
    error: ({ background }) => new Color("red").set({ "lch.l": 75 }),
    warning: ({ background }) => new Color("orange").set({ "lch.l": 75 }),
    success: ({ background }) => new Color("lime").set({ "lch.l": 75 }),
  },
  /* --- 2. Geração de Cores Foreground (Usa ThemeUtils.oppositeColor para o contraste) --- */
  {
    // A maioria dos foregounds serão gerados para ter contraste máximo
    cardForeground: ({ card }) => ThemeUtils.oppositeColor(card, { l: "full", s: "decrease" }),
    popoverForeground: ({ popover }) => ThemeUtils.oppositeColor(popover, { l: "full", s: "decrease" }),
    primaryForeground: ({ primary }) => ThemeUtils.oppositeColor(primary, { l: "full", s: "decrease" }),
    secondaryForeground: ({ secondary }) => ThemeUtils.oppositeColor(secondary, { l: "full", s: "decrease" }),
    mutedForeground: ({ muted }) => ThemeUtils.oppositeColor(muted, { l: "full", s: "decrease" }),
    accentForeground: ({ accent }) => ThemeUtils.oppositeColor(accent, { l: "full", s: "decrease" }),
    // Sidebar: Foreground será a cor primária brilhante
    sidebarForeground: ({ primary }) => new Color(primary).set({ "lch.l": 80, "lch.c": 100 }),
    sidebarPrimaryForeground: ({ sidebarPrimary }) => ThemeUtils.oppositeColor(sidebarPrimary, { l: "full", s: "decrease" }),
    sidebarAccentForeground: ({ sidebarAccent }) => ThemeUtils.oppositeColor(sidebarAccent, { l: "full", s: "decrease" }),
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
