import { _Global } from "./global/implementation";
import { _String, TUtilsString } from "@tsn-string/generic/implementations";
import { GlobalDeclaration } from "./global/types";
import { _Object } from "@tsn-object/generic/implementations";
import {
	TFunction,
	TLambdaToFunction,
	TRebindedFunction,
} from "@tsn-function/generic/types";
import { _Function } from "@tsn-function/generic/implementations";

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
		toKebabCase: GlobalDeclaration<TUtilsString["toKebabCase"]>;
		capitalize: GlobalDeclaration<TUtilsString["capitalize"]>;
		capitalizeAll: GlobalDeclaration<TUtilsString["capitalizeAll"]>;
		rightPad: GlobalDeclaration<TUtilsString["rightPad"]>;
		leftPad: GlobalDeclaration<TUtilsString["leftPad"]>;
		removeCharacters: GlobalDeclaration<TUtilsString["removeCharacters"]>;
		noAccent: GlobalDeclaration<TUtilsString["noAccent"]>;
		stringToCharCodeArray: GlobalDeclaration<TUtilsString["stringToCharCodeArray"]>;
		getFirstDifferentIndex: GlobalDeclaration<TUtilsString["getFirstDifferentIndex"]>;
		getLastDifferentIndex: GlobalDeclaration<TUtilsString["getLastDifferentIndex"]>;
	}

	interface Function {
		fn: TFunction | undefined;
		args: any[] | undefined;
		thisAsParameter<T extends TFunction>(
			this: T,
		): TLambdaToFunction<GlobalDeclaration<T>>;
		rebind<T extends TFunction>(
			this: T,
			context: any,
			...args: any[]
		): TRebindedFunction<T>;
	}
}

_Global.register(Function, {
	thisAsParameter: function (this) {
		return _Object.thisAsParameter(this);
	},
	rebind: function (
		this: TFunction,
		context: any,
		...args: any[]
	): TRebindedFunction<TFunction> {
		return _Function.rebind(this, context, ...args);
	} as any,
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
