import { FNV_OFFSET, FNV_PRIME, SPLITMIX_INCREMENT, SPLITMIX_MUL_A, SPLITMIX_MUL_B } from './declarations';

/** Aritmética de 32 bits usada pelo `Random` (só inteiros: dá o mesmo resultado em qualquer plataforma). */
class RandomUtils {
	/** Rotação à esquerda de uma palavra de 32 bits. */
	static rotl(value: number, shift: number): number {
		return (value << shift) | (value >>> (32 - shift));
	}

	/** Hash FNV-1a de 32 bits (texto → semente). */
	static hashSeed(text: string): number {
		let hash = FNV_OFFSET;
		for (let index = 0; index < text.length; index++) hash = Math.imul(hash ^ text.charCodeAt(index), FNV_PRIME);
		return hash >>> 0;
	}

	/** splitmix32: espalha uma semente de 32 bits em palavras de estado bem misturadas. */
	static splitmix(seed: number): () => number {
		let a = seed | 0;
		return () => {
			a = (a + SPLITMIX_INCREMENT) | 0;
			let t = a ^ (a >>> 16);
			t = Math.imul(t, SPLITMIX_MUL_A);
			t = t ^ (t >>> 15);
			t = Math.imul(t, SPLITMIX_MUL_B);
			return (t ^ (t >>> 15)) >>> 0;
		};
	}
}

export { RandomUtils };
