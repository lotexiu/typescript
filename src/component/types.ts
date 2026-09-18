import { Component } from "./model";

type TComponentKey = keyof Component;
type TComponentValue = Component[TComponentKey];

type TChanges<T> = {
	[P in keyof T]?: {
		oldValue: T[P];
		value: T[P];
	};
};

export { TComponentKey, TComponentValue, TChanges };
