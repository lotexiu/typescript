type TSyncedValueRead<T> = () => T;

type TSyncedValueWrite<T> = (value: T) => void;

export type { TSyncedValueRead, TSyncedValueWrite };
