function readonlyValue<const T>(compute: () => T) {
	let computed = false;
	let value: T;
	function instance() {
		if (!computed) {
			value = compute();
			computed = true;
		}
		return value;
	}
	return instance
}

export {
	readonlyValue
}