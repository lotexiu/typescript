import { _Global } from "./global/implementations";
import { _String } from "@tsn-string/implementations";
import { _Object } from "@tsn-object/implementations";
import { TFn, TFnDeclaration } from "@tsn-function/types";
import { _Function } from "@tsn-function/implementations";
import { TUString } from "@tsn-string/utils";
import { TEntriesReturn, TPath, TPathValue } from "@tsn-object/types";
import { TAs } from "./types";

declare global {
	interface String {
		toKebabCase: TFnDeclaration<TUString["toKebabCase"]>;
		capitalize: TFnDeclaration<TUString["capitalize"]>;
		capitalizeAll: TFnDeclaration<TUString["capitalizeAll"]>;
		noAccent: TFnDeclaration<TUString["noAccent"]>;
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
		children?: TFn;
		origin?: TFn;
	}

	interface Object {
		valueFromPath<const T,const Path extends TPath<T>>(this: T, path: Path): TPathValue<T, Path>
		setValueFromPath<const T, const Path extends TPath<T>, const Value extends TPathValue<T, Path>>(this: T, path: Path, value: Value): Value;
		update<T extends object, U extends Partial<T>>(this: T, updates: U): TAs<T, U>
		toEntries<T extends {}>(this: T): TEntriesReturn<T>[]
		toJson<T>(this: T, compact: boolean): string
	}
}

/* Always Function need to be registered first  */
_Global.register(Function, {
	thisAsParameter(this) { return _Function.thisAsParameter(this) },
	bind(this:any, ...args) { return _Function.rebind(this, ...args) },
});

_Global.register(Object, {
	setValueFromPath: _Object.setValueFromPath.thisAsParameter() as any,
	valueFromPath: _Object.valueFromPath.thisAsParameter() as any,
	update: _Object.update.thisAsParameter() as any,
	toEntries: _Object.entries.thisAsParameter() as any,
	toJson: _Object.json.thisAsParameter() as any,
});

_Global.register(String, {
	toKebabCase: _String.toKebabCase.thisAsParameter(),
	capitalize: _String.capitalize.thisAsParameter(),
	capitalizeAll: _String.capitalizeAll.thisAsParameter(),
	noAccent: _String.noAccent.thisAsParameter(),
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
