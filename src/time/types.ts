type TTimeUnit = 'ns' | 'µs' | 'ms' | 's' | 'min' | 'hour' | 'days' | 'week'

type TTimeConverted = {
	value: number,
	display: string,
	unit: TTimeUnit
}

export {
	TTimeConverted,
	TTimeUnit,
}