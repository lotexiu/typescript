import { StringUtils } from '@tsn-string/utils';

/** Ready-made filters for `Combobox`. */
class ComboboxUtils {
	/** Folds case and accents, so `'sao'` matches `'São Paulo'`. */
	static fold(text: string): string {
		return StringUtils.noAccent(text).toLocaleLowerCase();
	}

	/** Default filter: the label contains the typed text, ignoring case and accents. Empty text keeps everything. */
	static contains(label: string, text: string): boolean {
		return text === '' || ComboboxUtils.fold(label).includes(ComboboxUtils.fold(text));
	}

	/** Alternative filter: the label starts with the typed text, ignoring case and accents. */
	static startsWith(label: string, text: string): boolean {
		return text === '' || ComboboxUtils.fold(label).startsWith(ComboboxUtils.fold(text));
	}
}

export { ComboboxUtils };
