import { BPSearch } from "./BPSearch";
import { Pattern } from "./types";

/* TODO
	Criar um codigo que ira ler os patterns qual são expressões avançadas como o Regex
	e transformar em nodos para o algoritmo de busca semelhante ao SPSearch (Tipo de versão do Aho-Corasick)
	Como os nodos seriam talvez seja algo como:
	PatternNode {
		test: (char) => boolean, // função para testar se o char bate com o nodo
		next: PatternNode[], // O que vem depois (pode ser multiplos por causa de |)
		quantity: [min, max], // Quantidade de vezes que o nodo deve se repetir (pode ser infinito)
		modifier: ... // lookaround, negate, etc (Todos cujo podem estar ou ser adicionados em MODIFIERS)
	}

	Precisa ser visto melhor como os nodos irão ser como também realizar a criação do QUANTITY e MODIFIERS, com base como esses nodos funcionaram ou o oposto.
	Mas acredito que as constantes quantity e modifiers em implementations.ts serão semelhantes a constante EXR.
*/

export class APSearch extends BPSearch<Pattern> {
	resolve() {

	}
}
