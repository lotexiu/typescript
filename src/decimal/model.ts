import { DECIMAL_RADIX, DECIMAL_TEXT, MAX_EXPONENT } from './declarations';
import { DecimalUtils } from './utils';
import type { TDecimalInput, TRoundingMode } from './types';

/**
 * Número decimal **exato** (inteiro grande + escala): `0.1 + 0.2` dá `0.3`. Imutável, sem dependências, sem `Number` no meio.
 * A escala é a quantidade de casas e é preservada (`1.50` continua `1.50`); `+`, `−`, `×` são exatos, e só `divide`/`toScale`
 * arredondam — sempre com o modo explícito. Para dinheiro: `Decimal.fromMinor(1999n, 2)` = `19.99`, `toMinor(2)` volta a `1999n`.
 * Sem moeda, locale ou imposto: isso é de quem usa.
 */
class Decimal {
	private constructor(
		readonly coefficient: bigint,
		/** Casas decimais (≥ 0). */
		readonly scale: number
	) {}

	/** `undefined` se o texto não é um decimal (`'1,5'`, `'abc'`, `'1.'`). Aceita sinal e expoente (`'-1.5e3'`). */
	static tryParse(text: string): Decimal | undefined {
		const match = DECIMAL_TEXT.exec(text.trim());
		if (!match) return undefined;
		const [, sign, whole = '', fraction1 = '', fraction2 = '', exponentText = '0'] = match;
		const fraction = fraction1 || fraction2;
		const exponent = Number(exponentText);
		if (Math.abs(exponent) > MAX_EXPONENT) return undefined;
		let coefficient = BigInt((whole || '0') + fraction);
		let scale = fraction.length - exponent;
		if (scale < 0) {
			coefficient *= DecimalUtils.pow10(-scale);
			scale = 0;
		}
		return new Decimal(sign === '-' ? -coefficient : coefficient, scale);
	}

	static parse(text: string): Decimal {
		const result = Decimal.tryParse(text);
		if (!result) throw new RangeError(`Decimal inválido: "${text}"`);
		return result;
	}

	/** Número JS só se for finito (e então vale o que o JS imprime: `from(0.1)` = `0.1`); bigint vira inteiro. */
	static from(input: TDecimalInput): Decimal {
		if (input instanceof Decimal) return input;
		if (typeof input === 'bigint') return new Decimal(input, 0);
		if (typeof input === 'number') {
			if (!Number.isFinite(input)) throw new RangeError(`Decimal inválido: ${input}`);
			return Decimal.parse(String(input));
		}
		return Decimal.parse(input);
	}

	/** Unidades menores → decimal: `fromMinor(1999n, 2)` = `19.99`. */
	static fromMinor(minor: bigint, scale: number): Decimal {
		Decimal.#checkScale(scale);
		return new Decimal(minor, scale);
	}

	static sum(items: Iterable<TDecimalInput>): Decimal {
		let total = Decimal.fromMinor(0n, 0);
		for (const item of items) total = total.add(item);
		return total;
	}

	/**
	 * Reparte `total` em partes proporcionais a `weights` com `scale` casas **sem perder nem criar centavos**:
	 * a soma das partes é exatamente `total` (arredondado à escala). O resto vai, uma unidade por vez, para as primeiras partes.
	 */
	static allocate(total: TDecimalInput, weights: readonly TDecimalInput[], scale: number): Decimal[] {
		if (weights.length === 0) throw new RangeError('Decimal.allocate: sem pesos');
		const amount = Decimal.from(total).toScale(scale, 'half-up').coefficient;
		const decimals = weights.map((weight) => Decimal.from(weight));
		const common = Math.max(...decimals.map((weight) => weight.scale));
		const units = decimals.map((weight) => weight.toScale(common).coefficient);
		if (units.some((unit) => unit < 0n)) throw new RangeError('Decimal.allocate: pesos negativos');
		const sum = units.reduce((a, b) => a + b, 0n);
		if (sum === 0n) throw new RangeError('Decimal.allocate: a soma dos pesos é zero');
		const shares = units.map((unit) => (amount * unit) / sum);
		let leftover = amount - shares.reduce((a, b) => a + b, 0n);
		const step = leftover < 0n ? -1n : 1n;
		for (let index = 0; leftover !== 0n; index = (index + 1) % shares.length) {
			if (units[index] === 0n) continue;
			shares[index] += step;
			leftover -= step;
		}
		return shares.map((share) => new Decimal(share, scale));
	}

	static #checkScale(scale: number): void {
		if (!Number.isInteger(scale) || scale < 0) throw new RangeError(`Decimal: escala inválida (${scale})`);
	}

	/** Mesma escala para os dois, sem alterar o valor. */
	static #align(a: Decimal, b: Decimal): [bigint, bigint, number] {
		const scale = Math.max(a.scale, b.scale);
		return [a.coefficient * DecimalUtils.pow10(scale - a.scale), b.coefficient * DecimalUtils.pow10(scale - b.scale), scale];
	}

	add(other: TDecimalInput): Decimal {
		const [a, b, scale] = Decimal.#align(this, Decimal.from(other));
		return new Decimal(a + b, scale);
	}

	subtract(other: TDecimalInput): Decimal {
		const [a, b, scale] = Decimal.#align(this, Decimal.from(other));
		return new Decimal(a - b, scale);
	}

	/** Exato: a escala do resultado é a soma das escalas. */
	multiply(other: TDecimalInput): Decimal {
		const b = Decimal.from(other);
		return new Decimal(this.coefficient * b.coefficient, this.scale + b.scale);
	}

	/** Divide e arredonda para `scale` casas. A escala e o modo são **explícitos** (dividir não é exato). */
	divide(other: TDecimalInput, scale: number, mode: TRoundingMode = 'half-up'): Decimal {
		Decimal.#checkScale(scale);
		const b = Decimal.from(other);
		if (b.coefficient === 0n) throw new RangeError('Decimal: divisão por zero');
		const numerator = this.coefficient * DecimalUtils.pow10(b.scale + scale);
		const denominator = b.coefficient * DecimalUtils.pow10(this.scale);
		return new Decimal(DecimalUtils.divideRounded(numerator, denominator, mode), scale);
	}

	/** Resto da divisão com o sinal do dividendo (como `%`). */
	remainder(other: TDecimalInput): Decimal {
		const [a, b, scale] = Decimal.#align(this, Decimal.from(other));
		if (b === 0n) throw new RangeError('Decimal: divisão por zero');
		return new Decimal(a % b, scale);
	}

	/** Inteiro não negativo: `Decimal` exato (a escala cresce). */
	pow(exponent: number): Decimal {
		if (!Number.isInteger(exponent) || exponent < 0) throw new RangeError('Decimal.pow: expoente precisa ser inteiro ≥ 0');
		return new Decimal(this.coefficient ** BigInt(exponent), this.scale * exponent);
	}

	/** Passa para exatamente `scale` casas: completa com zeros ou arredonda pelo `mode`. */
	toScale(scale: number, mode: TRoundingMode = 'half-up'): Decimal {
		Decimal.#checkScale(scale);
		if (scale === this.scale) return this;
		if (scale > this.scale) return new Decimal(this.coefficient * DecimalUtils.pow10(scale - this.scale), scale);
		return new Decimal(DecimalUtils.divideRounded(this.coefficient, DecimalUtils.pow10(this.scale - scale), mode), scale);
	}

	/** Tira zeros à direita (`1.500` → `1.5`; `100` fica `100`). */
	strip(): Decimal {
		let { coefficient, scale } = this;
		while (scale > 0 && coefficient % DECIMAL_RADIX === 0n) {
			coefficient /= DECIMAL_RADIX;
			scale--;
		}
		return new Decimal(coefficient, scale);
	}

	negate(): Decimal {
		return new Decimal(-this.coefficient, this.scale);
	}

	abs(): Decimal {
		return this.coefficient < 0n ? this.negate() : this;
	}

	get sign(): -1 | 0 | 1 {
		return this.coefficient < 0n ? -1 : this.coefficient > 0n ? 1 : 0;
	}

	get isZero(): boolean {
		return this.coefficient === 0n;
	}

	static compare(a: TDecimalInput, b: TDecimalInput): -1 | 0 | 1 {
		const [x, y] = Decimal.#align(Decimal.from(a), Decimal.from(b));
		return x < y ? -1 : x > y ? 1 : 0;
	}

	/** Mesmo valor (`1.0` equals `1.00`). */
	equals(other: TDecimalInput): boolean {
		return Decimal.compare(this, other) === 0;
	}

	lessThan(other: TDecimalInput): boolean {
		return Decimal.compare(this, other) < 0;
	}

	greaterThan(other: TDecimalInput): boolean {
		return Decimal.compare(this, other) > 0;
	}

	/** Unidades menores na `scale` pedida (`19.99` → `1999n` com 2); arredonda se precisar. */
	toMinor(scale: number = this.scale, mode: TRoundingMode = 'half-up'): bigint {
		return this.toScale(scale, mode).coefficient;
	}

	toNumber(): number {
		return Number(this.toString());
	}

	/** Texto fixo, sem expoente, com todas as casas da escala. */
	toString(): string {
		const digits = DecimalUtils.abs(this.coefficient).toString().padStart(this.scale + 1, '0');
		const whole = digits.slice(0, digits.length - this.scale);
		const text = this.scale === 0 ? whole : `${whole}.${digits.slice(digits.length - this.scale)}`;
		return this.coefficient < 0n ? `-${text}` : text;
	}

	toFixed(scale: number, mode: TRoundingMode = 'half-up'): string {
		return this.toScale(scale, mode).toString();
	}

	toJSON(): string {
		return this.toString();
	}
}

export { Decimal };
