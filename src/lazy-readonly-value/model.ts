class LazyReadonlyValue<const T> {
	#compute?: ()=>T

	#value?: T
	get value(): T {
		if(this.#compute){
			this.#value = this.#compute()
			this.#compute = undefined
		}
		return this.#value!
	}

	constructor(compute:()=>T){
		this.#compute = compute
	}
}

function lazyReadonlyValue<const T>(compute: ()=>T) {
	return new LazyReadonlyValue(compute)
}

export {
	LazyReadonlyValue,
	lazyReadonlyValue
}