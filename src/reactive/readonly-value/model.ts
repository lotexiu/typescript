function readonlyValue<const T>(compute: ()=>T) {
	let value = compute()
	function instance() {
		return value ??= compute()
	}
	return instance
}

export {
	readonlyValue
}