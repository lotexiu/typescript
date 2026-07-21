import { _Validation } from "./implementations";

/** Public static wrapper over `_Validation` — direct, stateless validity checks (presence, pattern, CPF/CNPJ checksum). */
class ValidationUtils {
	static readonly required = _Validation.required;
	static readonly pattern = _Validation.pattern;
	static readonly isValidCPF = _Validation.isValidCPF;
	static readonly isValidCNPJ = _Validation.isValidCNPJ;
}

export {
	ValidationUtils
}
