class ReadonlyValue<const T> {
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

function readonlyValue<const T>(compute: ()=>T) {
	return new ReadonlyValue(compute)
}

export {
	ReadonlyValue,
	readonlyValue
}