import { DefaultThemeBuilder } from "./builders";

export const DefaultThemes = {
	// --- 1. TEMA BÁSICO (Para um visual sóbrio e profissional) ---
	basic: {
		dark: DefaultThemeBuilder({
			accent: "rgb(255, 87, 34)", // Laranja Vibrante
			background: "rgb(33, 33, 33)", // Cinza Escuro
			foreground: "rgb(245, 245, 245)", // Quase Branco
			primary: "rgb(30, 136, 229)", // Azul Padrão
		}),
		light: DefaultThemeBuilder({
			accent: "rgb(255, 87, 34)", // Laranja Vibrante
			background: "rgb(250, 250, 250)", // Cinza Claro
			foreground: "rgb(51, 51, 51)", // Cinza Escuro para Leitura
			primary: "rgb(25, 118, 210)", // Azul Mais Escuro
		}),
	},

	// --- 2. TEMA SYNTHWAVE (Cores neon e ambiente escuro) ---
	synthwave: {
		dark: DefaultThemeBuilder({
			accent: "rgb(255, 0, 150)", // Rosa Neon
			background: "rgb(15, 0, 30)", // Roxo Escuro Profundo
			foreground: "rgb(0, 255, 255)", // Ciano/Turquesa Neon
			primary: "rgb(255, 130, 0)", // Laranja Brilhante
		}),
		light: DefaultThemeBuilder({
			// Difícil para synthwave, mas tentando manter a paleta clara
			accent: "rgb(255, 0, 150)",
			background: "rgb(240, 240, 240)",
			foreground: "rgb(50, 50, 100)",
			primary: "rgb(0, 200, 200)",
		}),
	},

	synthwaveNeon: {
    dark: DefaultThemeBuilder({
      // Cores retiradas da estética Neon/Vaporwave
      accent: "rgb(255, 68, 160)",  // Magenta/Rosa Brilhante (Sol)
      background: "rgb(8, 0, 26)",   // Roxo/Preto Quase Puro
      foreground: "rgb(0, 255, 255)", // Ciano Puro (Usado para o texto principal)
      primary: "rgb(100, 0, 153)",  // Rosa Neon (Topo da Barra / Grid)
    }),
    light: DefaultThemeBuilder({
      // Synthwave em modo claro é inviável, mas forçamos a paleta
      accent: "rgb(255, 68, 160)",
      background: "rgb(240, 240, 255)",
      foreground: "rgb(20, 0, 50)",
      primary: "rgb(0, 150, 150)",
    }),
	},

	// --- 3. TEMA MINIMALIST (Clean, focando em branco, preto e um toque de cor) ---
	minimalist: {
		dark: DefaultThemeBuilder({
			accent: "rgb(120, 120, 120)", // Cinza Suave
			background: "rgb(18, 18, 18)", // Preto Profundo
			foreground: "rgb(230, 230, 230)", // Branco Suave
			primary: "rgb(100, 200, 100)", // Verde Calmo (Para Destaque)
		}),
		light: DefaultThemeBuilder({
			accent: "rgb(150, 150, 150)", // Cinza Médio
			background: "rgb(255, 255, 255)", // Branco Puro
			foreground: "rgb(30, 30, 30)", // Preto Forte
			primary: "rgb(80, 180, 80)", // Verde Calmo
		}),
	},

	// --- 4. TEMA FOREST (Inspirado em musgo, madeira e céu) ---
	forest: {
		dark: DefaultThemeBuilder({
			accent: "rgb(200, 150, 100)", // Marrom Claro (Madeira)
			background: "rgb(20, 40, 25)", // Verde Escuro Profundo (Floresta)
			foreground: "rgb(220, 255, 220)", // Branco Esverdeado
			primary: "rgb(80, 180, 80)", // Verde Musgo
		}),
		light: DefaultThemeBuilder({
			accent: "rgb(130, 90, 50)", // Marrom Escuro
			background: "rgb(230, 245, 230)", // Verde/Cinza Muito Claro
			foreground: "rgb(30, 40, 30)", // Verde Escuro para Texto
			primary: "rgb(40, 140, 40)", // Verde Floresta
		}),
	},

	// --- 5. TEMA OCEANIC (Azuis profundos e areia) ---
	oceanic: {
		dark: DefaultThemeBuilder({
			accent: "rgb(0, 191, 255)", // Azul Céu Claro
			background: "rgb(10, 20, 50)", // Azul Marinho Profundo
			foreground: "rgb(255, 250, 240)", // Areia/Branco
			primary: "rgb(0, 128, 192)", // Azul Médio (Oceano)
		}),
		light: DefaultThemeBuilder({
			accent: "rgb(0, 120, 180)", // Azul Oceano
			background: "rgb(240, 250, 255)", // Branco Azulado
			foreground: "rgb(20, 40, 60)", // Azul Escuro para Texto
			primary: "rgb(50, 150, 220)", // Azul Céu
		}),
	},

	// --- 6. TEMA VOLCANIC (Cores quentes e ricas) ---
	volcanic: {
		dark: DefaultThemeBuilder({
			accent: "rgb(255, 120, 0)", // Laranja Lava
			background: "rgb(40, 20, 20)", // Vermelho Escuro/Preto Vulcânico
			foreground: "rgb(250, 250, 200)", // Creme/Areia
			primary: "rgb(200, 0, 0)", // Vermelho Forte
		}),
		light: DefaultThemeBuilder({
			accent: "rgb(200, 80, 0)", // Laranja Escuro
			background: "rgb(255, 245, 240)", // Salmão Claro
			foreground: "rgb(80, 30, 30)", // Marrom Escuro Avermelhado
			primary: "rgb(150, 0, 0)", // Vermelho Vinho
		}),
	},
};
