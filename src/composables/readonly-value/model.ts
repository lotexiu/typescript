/**
 * A value computed on first read and kept: `const text = readonlyValue(() => source.slice(a, b)); text()`. Not reactive.
 */
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