import { BYTES_PER_WORD, STATE_WORDS, UINT32_RANGE } from './declarations';
import { RandomUtils } from './utils';
import type { TRandomSeed, TRandomState, TWeighted } from './types';

/**
 * Gerador pseudoaleatório **determinístico** (xoshiro128**, estado de 4×32 bits, semente via splitmix32).
 * Mesma semente → mesma sequência em qualquer plataforma/linguagem (só aritmética de inteiros de 32 bits):
 * serve para jogos, simulação, testes reproduzíveis e replays. **Não** é criptográfico — para segredos use `IdUtils`.
 */
class Random {
	#s0 = 0;
	#s1 = 0;
	#s2 = 0;
	#s3 = 0;

	/** Sem semente: usa `Math.random()` (não reproduzível). */
	constructor(seed: TRandomSeed = Math.floor(Math.random() * UINT32_RANGE)) {
		const next = RandomUtils.splitmix(typeof seed === 'string' ? RandomUtils.hashSeed(seed) : Math.trunc(seed) >>> 0);
		this.#assign([next(), next(), next(), next()]);
	}

	/** Recria um gerador exatamente no ponto em que `state()` foi lido. */
	static fromState(state: TRandomState): Random {
		const random = new Random(0);
		random.setState(state);
		return random;
	}

	state(): TRandomState {
		return [this.#s0, this.#s1, this.#s2, this.#s3];
	}

	setState(state: TRandomState): void {
		if (state.length !== STATE_WORDS || state.some((word) => !Number.isInteger(word))) throw new RangeError('Random: estado inválido');
		this.#assign(state.map((word) => word >>> 0) as unknown as TRandomState);
	}

	/** Cópia independente (avançar uma não mexe na outra). */
	clone(): Random {
		return Random.fromState(this.state());
	}

	#assign([a, b, c, d]: TRandomState): void {
		const empty = (a | b | c | d) === 0;
		this.#s0 = empty ? 1 : a;
		this.#s1 = b;
		this.#s2 = c;
		this.#s3 = d;
	}

	/** Próxima palavra de 32 bits sem sinal. */
	nextUint32(): number {
		const result = Math.imul(RandomUtils.rotl(Math.imul(this.#s1, 5), 7), 9) >>> 0;
		const t = this.#s1 << 9;
		this.#s2 ^= this.#s0;
		this.#s3 ^= this.#s1;
		this.#s1 ^= this.#s2;
		this.#s0 ^= this.#s3;
		this.#s2 ^= t;
		this.#s3 = RandomUtils.rotl(this.#s3, 11);
		this.#s0 >>>= 0;
		this.#s1 >>>= 0;
		this.#s2 >>>= 0;
		this.#s3 >>>= 0;
		return result;
	}

	/** Real em `[0, 1)`. */
	uniform(): number {
		return this.nextUint32() / UINT32_RANGE;
	}

	/** Inteiro em `[min, max]` (**os dois inclusivos**); a amplitude cabe em 2³². */
	int(min: number, max: number): number {
		if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) throw new RangeError(`Random.int: intervalo inválido [${min}, ${max}]`);
		const span = max - min + 1;
		if (span > UINT32_RANGE) throw new RangeError('Random.int: amplitude maior que 2^32');
		return min + Math.floor(this.uniform() * span);
	}

	/** `true` com probabilidade `p` (padrão 0,5). */
	chance(p = 0.5): boolean {
		return this.uniform() < p;
	}

	/** Distribuição normal (Box–Muller). */
	normal(mean = 0, deviation = 1): number {
		const u1 = 1 - this.uniform();
		const u2 = this.uniform();
		return mean + deviation * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
	}

	/** Um item ao acaso (`undefined` se vazio). */
	pick<T>(items: readonly T[]): T | undefined {
		return items.length === 0 ? undefined : items[this.int(0, items.length - 1)];
	}

	/** Cópia embaralhada (Fisher–Yates); a entrada não muda. */
	shuffle<T>(items: readonly T[]): T[] {
		const result = [...items];
		for (let index = result.length - 1; index > 0; index--) {
			const other = this.int(0, index);
			[result[index], result[other]] = [result[other], result[index]];
		}
		return result;
	}

	/** Escolhe por peso (pesos ≤ 0 nunca saem). `undefined` se nenhum peso positivo. */
	weighted<T>(entries: readonly TWeighted<T>[]): T | undefined {
		const total = entries.reduce((sum, { weight }) => sum + Math.max(0, weight), 0);
		if (total <= 0) return undefined;
		let target = this.uniform() * total;
		for (const { value, weight } of entries) {
			if (weight <= 0) continue;
			if (target < weight) return value;
			target -= weight;
		}
		return entries.findLast(({ weight }) => weight > 0)?.value;
	}

	/** `size` bytes (little-endian por palavra). Base para `IdUtils.uuid(random.bytes(16))` determinístico. */
	bytes(size: number): Uint8Array {
		const result = new Uint8Array(size);
		for (let index = 0; index < size; index += BYTES_PER_WORD) {
			const word = this.nextUint32();
			for (let offset = 0; offset < BYTES_PER_WORD && index + offset < size; offset++) result[index + offset] = (word >>> (8 * offset)) & 0xff;
		}
		return result;
	}
}

export { Random };
