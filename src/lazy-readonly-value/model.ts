class LazyReadonlyValue<const T> {
	private compute?: ()=>T

	_value?: T
	get value():T{
		if(this.compute){
			this._value = this.compute()
			this.compute = undefined
		}
		return this._value!
	}

	constructor(compute:()=>T){
		this.compute = compute
	}
}

function lazyReadonlyValue<const T>(compute: ()=>T) {
	return new LazyReadonlyValue(compute)
}

export {
	LazyReadonlyValue,
	lazyReadonlyValue
}