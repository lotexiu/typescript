import { TTimeout } from "./types";

/** The real `NodeJS.Timeout` type/value pair — Node doesn't expose this constructor directly, so it's recovered from a throwaway `setTimeout` call. */
type Timeout = NodeJS.Timeout;
/** The real `NodeJS.Timeout` type/value pair — Node doesn't expose this constructor directly, so it's recovered from a throwaway `setTimeout` call. */
const Timeout: TTimeout = setTimeout(()=>{}).constructor as any;

export {
	Timeout
}
