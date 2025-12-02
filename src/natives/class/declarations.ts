import { TTimeout } from "./types";

const Timeout: TTimeout = setTimeout(()=>{}).constructor as any;

export {
	Timeout
}
