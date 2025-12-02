import { TConstructor } from "./types";

export function instaceOf<T>(obj: any, constructor: TConstructor<T>): obj is T {
	return obj instanceof constructor;
}
