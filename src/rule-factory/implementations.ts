import { TFactoryRules, TFactoryResult } from "./types";

/**
 * Cria uma factory reutilizável a partir de regras declaradas: cada slot
 * sabe calcular seu próprio valor (a partir das seeds e/ou de outros slots
 * já declarados antes dele, via `get`) e, opcionalmente, sugerir um valor
 * melhor sem forçá-lo — a sugestão nunca substitui o valor calculado, só
 * fica disponível à parte (em `suggestions`) pra quem quiser aplicar.
 *
 * Resolução segue estritamente a ordem de declaração: `get('outroSlot')`
 * só enxerga slots já resolvidos (declarados antes). Isso é intencional —
 * exige um mínimo de organização de quem escreve as regras (pensar a ordem
 * de dependência), em troca de dispensar cache/rastreio de ciclo em runtime:
 * dependência circular fica estruturalmente impossível, não algo detectado
 * caro a cada resolução.
 *
 * Base comum pensada pra paleta de cores e tema (ambos "seeds -> slots
 * derivados, com correção opcional") — este módulo não sabe nada de cor,
 * só resolve slots genéricos.
 */
function createFactory<TSeeds, TSlots extends object>(
	rules: TFactoryRules<TSeeds, TSlots>,
) {
	const keys = Object.keys(rules) as (keyof TSlots)[];

	return function build(seeds: TSeeds): TFactoryResult<TSlots> {
		const values = {} as TSlots;
		const resolved = new Set<keyof TSlots>();

		function get<K extends keyof TSlots>(slot: K): TSlots[K] {
			if (!resolved.has(slot)) {
				throw new Error(
					`Slot "${String(slot)}" was not resolved yet — declare it before whatever depends on it.`,
				);
			}
			return values[slot];
		}

		for (const key of keys) {
			values[key] = rules[key].derive({ seeds, get });
			resolved.add(key);
		}

		const suggestions: Partial<TSlots> = {};
		for (const key of keys) {
			const suggested = rules[key].suggest?.(values[key], { seeds, get });
			if (suggested !== undefined && suggested !== values[key]) {
				suggestions[key] = suggested;
			}
		}

		return { values, suggestions };
	};
}

export {
	createFactory
}
