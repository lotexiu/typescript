import { TConstructor, TFn } from "@tsn-function/types";
import { TKeyOf } from "@tsn-object/types";

/** The shape `_Global.register` expects: an optional function-valued override for each method of `T`'s instances (except `valueOf`). */
type TargetImpl<T extends TConstructor, I extends InstanceType<T> = InstanceType<T>> = {
	[Key in TKeyOf<I, {exclude: 'valueOf'|'constructor'}>]?:
		I[Key] extends TFn
			? I[Key]
			: never;
}


export {
	TargetImpl
}