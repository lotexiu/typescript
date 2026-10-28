import { RegexUtils } from '@tsn/regex/utils';
import { DEFAULT_SHORT_SIZE, HEX_TABLE, MAX_ALPHABET, URL_ALPHABET, UUID_BYTES, UUID_V4_VERSION, UUID_VARIANT } from './declarations';
import type { TByteSource, TShortIdOptions } from './types';

/** Geração de identificadores. A formatação é pura; só `bytes` (fonte de aleatoriedade) é trocável. */
class IdUtils {
	/** Alfabeto padrão de `short` (64 símbolos seguros para URL). */
	static readonly urlAlphabet = URL_ALPHABET;

	/** Bytes seguros do ambiente (`crypto.getRandomValues`). Lança se o ambiente não tiver `crypto`. */
	static bytes(size: number): Uint8Array {
		const crypto = globalThis.crypto;
		if (!crypto?.getRandomValues) throw new Error('IdUtils: crypto.getRandomValues indisponível; passe uma fonte de bytes');
		return crypto.getRandomValues(new Uint8Array(size));
	}

	/** UUID v4 (RFC 4122). Passe `bytes` (16) para resultado determinístico. */
	static uuid(bytes: Uint8Array = IdUtils.bytes(UUID_BYTES)): string {
		if (bytes.length !== UUID_BYTES) throw new RangeError('IdUtils.uuid: são necessários 16 bytes');
		const b = Uint8Array.from(bytes);
		b[6] = (b[6] & 0x0f) | UUID_V4_VERSION;
		b[8] = (b[8] & 0x3f) | UUID_VARIANT;
		const h = (from: number, to: number) => Array.from(b.slice(from, to), (byte) => HEX_TABLE[byte]).join('');
		return `${h(0, 4)}-${h(4, 6)}-${h(6, 8)}-${h(8, 10)}-${h(10, 16)}`;
	}

	static isUuid(text: string): boolean {
		return RegexUtils.isUuid(text);
	}

	/** Id curto (estilo nanoid): `size` símbolos do `alphabet`, sem viés (amostragem por rejeição). */
	static short({ size = DEFAULT_SHORT_SIZE, alphabet = IdUtils.urlAlphabet, bytes = IdUtils.bytes }: TShortIdOptions = {}): string {
		if (!Number.isInteger(size) || size < 1) throw new RangeError('IdUtils.short: size inválido');
		if (alphabet.length < 2 || alphabet.length > MAX_ALPHABET) throw new RangeError('IdUtils.short: o alfabeto precisa ter de 2 a 256 símbolos');
		const mask = (2 << Math.floor(Math.log2(alphabet.length - 1))) - 1;
		const step = Math.ceil((1.6 * mask * size) / alphabet.length);
		let id = '';
		while (id.length < size) {
			for (const byte of (bytes as TByteSource)(step)) {
				const symbol = alphabet[byte & mask];
				if (symbol !== undefined) {
					id += symbol;
					if (id.length === size) break;
				}
			}
		}
		return id;
	}
}

export { IdUtils };
