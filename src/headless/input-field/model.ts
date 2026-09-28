import { computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';
import { debouncedValue } from '@ts/composables/debounced-value/model';
import { Mask } from '@ts/mask/model';
import { toggle } from '@tsr/toggle/model';
import { TInputField, TInputFieldConfig } from './types';

function inputField<T = string>(config: TInputFieldConfig<T> = {}): TInputField<T> {
	const {
		mask,
		parse = (raw: string) => raw as unknown as T,
		format = (value: T) => String(value ?? ''),
		disabled: initialDisabled = false,
		debounce = 0,
	} = config;

	const display = signal('');
	const disabled = signal(initialDisabled);
	const showPassword = toggle(false);

	const raw = computed(() => (mask ? Mask.unapply(display(), mask) : display()));
	const value = computed(() => parse(raw()));

	const committed = debouncedValue(value(), debounce);
	value.subscribe((next) => committed.value.set(next));

	function setText(next: string): void {
		// `Mask.apply` unapplies internally first, so it's safe to feed it text that already
		// contains the mask's own literal characters (re-typing over an already-formatted display).
		display.set(mask ? Mask.apply(next, mask) : next);
	}

	function setValue(next: T): void {
		const nextRaw = format(next);
		display.set(mask ? Mask.apply(nextRaw, mask) : nextRaw);
	}

	if (config.initial !== undefined) setValue(config.initial);

	return {
		display,
		raw,
		value,
		settledValue: committed.debounced,
		disabled,
		showPassword,
		setText,
		setValue,
	};
}

export { inputField };
