import { _Global } from "./global/implementations";
import { _String } from "@tsn-string/implementations";
import { _Object } from "@tsn-object/implementations";
import { TBindFn, TFn, TFnDeclaration, TParameters } from "@tsn-function/types";
import { _Function } from "@tsn-function/implementations";
import { TUString } from "@tsn-string/utils";

declare global {
	// TODO: Implement Number extensions
	// interface Number {
	// 	hasDecimals(): boolean;
	// 	getDecimals(): number | undefined;
	//
	// 	/* Operators */
	// 	"/"(...divideValues: number[]): number;
	// 	"*"(...multiplyValues: number[]): number;
	// 	"+"(...plusValues: number[]): number;
	// 	"-"(...minusValues: number[]): number;
	// 	"%"(value: number): number;
	//
	// 	divide(...divideValues: number[]): number;
	// 	multiply(...multiplyValues: number[]): number;
	// 	sum(...plusValues: number[]): number;
	// 	minus(...minusValues: number[]): number;
	// 	mod(value: number): number;
	// 	trunc(): number;
	// }

	interface String {
		toKebabCase: TFnDeclaration<TUString["toKebabCase"]>;
		capitalize: TFnDeclaration<TUString["capitalize"]>;
		capitalizeAll: TFnDeclaration<TUString["capitalizeAll"]>;
		rightPad: TFnDeclaration<TUString["rightPad"]>;
		leftPad: TFnDeclaration<TUString["leftPad"]>;
		removeCharacters: TFnDeclaration<TUString["removeCharacters"]>;
		noAccent: TFnDeclaration<TUString["noAccent"]>;
		stringToCharCodeArray: TFnDeclaration<TUString["stringToCharCodeArray"]>;
		getFirstDifferentIndex: TFnDeclaration<TUString["getFirstDifferentIndex"]>;
		getLastDifferentIndex: TFnDeclaration<TUString["getLastDifferentIndex"]>;
	}

	interface Function {
		thisAsParameter<T extends TFn>(this: T): TFnDeclaration<T>;
		rebind<T extends TFn>(this: T, context: any, ...args: any[]): TBindFn<{ fn: T; context: any; args: any[] }>;
		negate<T extends TFn>(this: T): ((...args: TParameters<T>) => boolean) & { fn: T };
	}
}

_Global.register(Function, {
	thisAsParameter(this) { return _Function.thisAsParameter(this) },
	rebind(this, context, ...args) { return _Function.rebind(this, context, ...args) },
	negate(this) { return _Function.negate(this) },
});

_Global.register(String, {
	toKebabCase: _String.toKebabCase.thisAsParameter(),
	capitalize: _String.capitalize.thisAsParameter(),
	capitalizeAll: _String.capitalizeAll.thisAsParameter(),
	rightPad: _String.rightPad.thisAsParameter(),
	leftPad: _String.leftPad.thisAsParameter(),
	removeCharacters: _String.removeCharacters.thisAsParameter(),
	noAccent: _String.noAccent.thisAsParameter(),
	stringToCharCodeArray: _String.stringToCharCodeArray.thisAsParameter(),
	getFirstDifferentIndex: _String.getFirstDifferentIndex.thisAsParameter(),
	getLastDifferentIndex: _String.getLastDifferentIndex.thisAsParameter(),
});
