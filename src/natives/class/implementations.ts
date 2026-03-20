import { TConstructor } from "./types";

export function instanceOf<T>(obj: any, constructor: TConstructor<T>): obj is T {
	return obj instanceof constructor;
}
