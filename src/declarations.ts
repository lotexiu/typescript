import { GlobalUtils } from './global/utils';
import { TFn, TFnDeclaration } from '@tsn-function/types';
import { StringUtils, TUString } from '@tsn-string/utils';
import { TEntriesReturn, TPath, TPathValue } from '@tsn-object/types';
import { TAs } from './types';
import { FunctionUtils } from '@tsn-function/utils';
import { ObjectUtils } from '@tsn-object/utils';

declare global {
	interface String {
		toKebabCase: TFnDeclaration<TUString['toKebabCase']>;
		capitalize: TFnDeclaration<TUString['capitalize']>;
		capitalizeAll: TFnDeclaration<TUString['capitalizeAll']>;
		noAccent: TFnDeclaration<TUString['noAccent']>;
		charCodeArray: TFnDeclaration<TUString['charCodeArray']>;
		isIdentifier: TFnDeclaration<TUString['isIdentifier']>;
		isLetter: TFnDeclaration<TUString['isLetter']>;
		isLowerCase: TFnDeclaration<TUString['isLowerCase']>;
		isUpperCase: TFnDeclaration<TUString['isUpperCase']>;
		isDigit: TFnDeclaration<TUString['isDigit']>;
		isLetterOrDigit: TFnDeclaration<TUString['isLetterOrDigit']>;
		isHexadecimal: TFnDeclaration<TUString['isHexadecimal']>;
		isFormatting: TFnDeclaration<TUString['isFormatting']>;
		isWhitespace: TFnDeclaration<TUString['isWhitespace']>;
		isLineBreak: TFnDeclaration<TUString['isLineBreak']>;
		isTab: TFnDeclaration<TUString['isTab']>;
		isCarriageReturn: TFnDeclaration<TUString['isCarriageReturn']>;
		isFormFeed: TFnDeclaration<TUString['isFormFeed']>;
		isVerticalTab: TFnDeclaration<TUString['isVerticalTab']>;
		isMathOperator: TFnDeclaration<TUString['isMathOperator']>;
		isRelationalOperator: TFnDeclaration<TUString['isRelationalOperator']>;
		isBitwireOperator: TFnDeclaration<TUString['isBitwireOperator']>;
		isPunctuation: TFnDeclaration<TUString['isPunctuation']>;
		isSymbol: TFnDeclaration<TUString['isSymbol']>;
		isEscape: TFnDeclaration<TUString['isEscape']>;
		forEach: TFnDeclaration<TUString['forEach']>;
		onChar: TFnDeclaration<TUString['onChar']>;
	}

	interface Function {
		thisAsParameter<T extends TFn>(this: T): TFn;
		children?: TFn;
		origin?: TFn;
	}

	interface Object {
		valueFromPath<const T, const Path extends TPath<T>>(this: T, path: Path): TPathValue<T, Path>;
		setValueFromPath<const T, const Path extends TPath<T>, const Value extends TPathValue<T, Path>>(
			this: T,
			path: Path,
			value: Value
		): Value;
		update<T extends object, U extends Partial<T>>(this: T, updates: U): TAs<T, U>;
		toJson<T>(this: T, compact: boolean): string;
	}

	interface ObjectConstructor {
		entries<T>(o: T): TEntriesReturn<T>;
	}

	interface Array<T> {
		includes<U>(value: U): value is U & T;
	}
}

/* Always Function need to be registered first  */
GlobalUtils.register(Function, {
	thisAsParameter(this) {
		return FunctionUtils.thisAsParameter(this);
	},
	bind(this: any, ...args) {
		return FunctionUtils.rebind(this, ...args);
	},
});

GlobalUtils.register(Object, {
	setValueFromPath: ObjectUtils.setValueFromPath.thisAsParameter(),
	valueFromPath: ObjectUtils.valueFromPath.thisAsParameter(),
	update: ObjectUtils.update.thisAsParameter() as any,
	toJson: ObjectUtils.json.thisAsParameter(),
});

GlobalUtils.register(String, {
	toKebabCase: StringUtils.toKebabCase.thisAsParameter(),
	capitalize: StringUtils.capitalize.thisAsParameter(),
	capitalizeAll: StringUtils.capitalizeAll.thisAsParameter(),
	noAccent: StringUtils.noAccent.thisAsParameter(),
	charCodeArray: StringUtils.charCodeArray.thisAsParameter(),
	isIdentifier: StringUtils.isIdentifier.thisAsParameter(),
	isLetter: StringUtils.isLetter.thisAsParameter(),
	isLowerCase: StringUtils.isLowerCase.thisAsParameter(),
	isUpperCase: StringUtils.isUpperCase.thisAsParameter(),
	isDigit: StringUtils.isDigit.thisAsParameter(),
	isLetterOrDigit: StringUtils.isLetterOrDigit.thisAsParameter(),
	isHexadecimal: StringUtils.isHexadecimal.thisAsParameter(),
	isFormatting: StringUtils.isFormatting.thisAsParameter(),
	isWhitespace: StringUtils.isWhitespace.thisAsParameter(),
	isLineBreak: StringUtils.isLineBreak.thisAsParameter(),
	isTab: StringUtils.isTab.thisAsParameter(),
	isCarriageReturn: StringUtils.isCarriageReturn.thisAsParameter(),
	isFormFeed: StringUtils.isFormFeed.thisAsParameter(),
	isVerticalTab: StringUtils.isVerticalTab.thisAsParameter(),
	isMathOperator: StringUtils.isMathOperator.thisAsParameter(),
	isRelationalOperator: StringUtils.isRelationalOperator.thisAsParameter(),
	isBitwireOperator: StringUtils.isBitwireOperator.thisAsParameter(),
	isPunctuation: StringUtils.isPunctuation.thisAsParameter(),
	isSymbol: StringUtils.isSymbol.thisAsParameter(),
	isEscape: StringUtils.isEscape.thisAsParameter(),
	forEach: StringUtils.forEach.thisAsParameter(),
	onChar: StringUtils.onChar.thisAsParameter(),
});
