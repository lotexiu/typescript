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
		noAccent: TFnDeclaration<TUString["noAccent"]>;
		firstDifferentIndex: TFnDeclaration<TUString["getFirstDifferentIndex"]>;
		lastDifferentIndex: TFnDeclaration<TUString["getLastDifferentIndex"]>;
		charCodeArray: TFnDeclaration<TUString["charCodeArray"]>;
		isIdentifier: TFnDeclaration<TUString["isIdentifier"]>;
		isLetter: TFnDeclaration<TUString["isLetter"]>;
		isLowerCase: TFnDeclaration<TUString["isLowerCase"]>;
		isUpperCase: TFnDeclaration<TUString["isUpperCase"]>;
		isDigit: TFnDeclaration<TUString["isDigit"]>;
		isLetterOrDigit: TFnDeclaration<TUString["isLetterOrDigit"]>;
		isHexadecimal: TFnDeclaration<TUString["isHexadecimal"]>;
		isFormatting: TFnDeclaration<TUString["isFormatting"]>;
		isWhitespace: TFnDeclaration<TUString["isWhitespace"]>;
		isLineBreak: TFnDeclaration<TUString["isLineBreak"]>;
		isTab: TFnDeclaration<TUString["isTab"]>;
		isCarriageReturn: TFnDeclaration<TUString["isCarriageReturn"]>;
		isFormFeed: TFnDeclaration<TUString["isFormFeed"]>;
		isVerticalTab: TFnDeclaration<TUString["isVerticalTab"]>;
		isMathOperator: TFnDeclaration<TUString["isMathOperator"]>;
		isRelationalOperator: TFnDeclaration<TUString["isRelationalOperator"]>;
		isBitwireOperator: TFnDeclaration<TUString["isBitwireOperator"]>;
		isPunctuation: TFnDeclaration<TUString["isPunctuation"]>;
		isSymbol: TFnDeclaration<TUString["isSymbol"]>;
		isEscape: TFnDeclaration<TUString["isEscape"]>;
		forEach: TFnDeclaration<TUString["forEach"]>;
		onChar: TFnDeclaration<TUString["onChar"]>;
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
	noAccent: _String.noAccent.thisAsParameter(),
	firstDifferentIndex: _String.getFirstDifferentIndex.thisAsParameter(),
	lastDifferentIndex: _String.getLastDifferentIndex.thisAsParameter(),
	charCodeArray: _String.charCodeArray.thisAsParameter(),
	isIdentifier: _String.isIdentifier.thisAsParameter(),
	isLetter: _String.isLetter.thisAsParameter(),
	isLowerCase: _String.isLowerCase.thisAsParameter(),
	isUpperCase: _String.isUpperCase.thisAsParameter(),
	isDigit: _String.isDigit.thisAsParameter(),
	isLetterOrDigit: _String.isLetterOrDigit.thisAsParameter(),
	isHexadecimal: _String.isHexadecimal.thisAsParameter(),
	isFormatting: _String.isFormatting.thisAsParameter(),
	isWhitespace: _String.isWhitespace.thisAsParameter(),
	isLineBreak: _String.isLineBreak.thisAsParameter(),
	isTab: _String.isTab.thisAsParameter(),
	isCarriageReturn: _String.isCarriageReturn.thisAsParameter(),
	isFormFeed: _String.isFormFeed.thisAsParameter(),
	isVerticalTab: _String.isVerticalTab.thisAsParameter(),
	isMathOperator: _String.isMathOperator.thisAsParameter(),
	isRelationalOperator: _String.isRelationalOperator.thisAsParameter(),
	isBitwireOperator: _String.isBitwireOperator.thisAsParameter(),
	isPunctuation: _String.isPunctuation.thisAsParameter(),
	isSymbol: _String.isSymbol.thisAsParameter(),
	isEscape: _String.isEscape.thisAsParameter(),
	forEach: _String.forEach.thisAsParameter(),
	onChar: _String.onChar.thisAsParameter(),
});
