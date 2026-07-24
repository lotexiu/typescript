type TTimeUnit = 'ns' | 'µs' | 'ms' | 's' | 'min'

type TTimeConverted = {
	value: string,
	unit: TTimeUnit
}

export {
	TTimeConverted,
	TTimeUnit,
}