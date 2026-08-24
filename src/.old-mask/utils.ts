import { _Mask, TUtilsMask } from './implementations';

/** Public static wrapper over `_Mask` — compile/apply/unapply/validate input masks, plus registering custom token characters. */
class MaskUtils {
	static compile: TUtilsMask['compile'] = _Mask.compile;
	static apply: TUtilsMask['apply'] = _Mask.apply;
	static unapply: TUtilsMask['unapply'] = _Mask.unapply;
	static isValid: TUtilsMask['isValid'] = _Mask.isValid;
	static registerToken: TUtilsMask['registerToken'] = _Mask.registerToken;
	static unregisterToken: TUtilsMask['unregisterToken'] = _Mask.unregisterToken;
	static getTokenKeys: TUtilsMask['getTokenKeys'] = _Mask.getTokenKeys;
	static caretPositionAfterFormat: TUtilsMask['caretPositionAfterFormat'] = _Mask.caretPositionAfterFormat;
}

export {
	MaskUtils
}