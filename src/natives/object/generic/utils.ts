import { _Object, TUtilsObject } from "./implementations"

export class ObjectUtils {
	static isEmptyObj: TUtilsObject['isEmptyObj'] = _Object.isEmptyObj;
	static isAClassDeclaration: TUtilsObject['isAClassDeclaration'] = _Object.isAClassDeclaration;
	static circularReferenceHandler: TUtilsObject['circularReferenceHandler'] = _Object.circularReferenceHandler;
	static addPrefixToKeys: TUtilsObject['addPrefixToKeys'] = _Object.addPrefixToKeys;
	static getValueFromPath: TUtilsObject['getValueFromPath'] = _Object.getValueFromPath;
	static setValueFromPath: TUtilsObject['setValueFromPath'] = _Object.setValueFromPath;
	static removeNullFields: TUtilsObject['removeNullFields'] = _Object.removeNullFields;
	static thisAsParameter: TUtilsObject['thisAsParameter'] = _Object.thisAsParameter;
	static differenceBetweenObjects: TUtilsObject['differenceBetweenObjects'] = _Object.differenceBetweenObjects;
}
