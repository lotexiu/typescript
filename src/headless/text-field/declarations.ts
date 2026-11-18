/**
 * Error codes produced by `TextField` itself. Masks add their own (`pattern`, `range`...). Turn codes into messages in the app.
 */
const TEXT_FIELD_ERRORS = {
	REQUIRED: 'required',
	TOO_LONG: 'tooLong',
} as const;

export { TEXT_FIELD_ERRORS };
