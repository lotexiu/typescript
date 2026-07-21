import { TConstructor, TFn } from "@tsn-function/types";
import { TargetImpl } from "./types";


/**
 * @internal
*/
class _Global {
	static register<Target extends TConstructor>(target: Target, extension: TargetImpl<Target>) {
		try {
			Object.entries(extension).forEach(([key, value]) => {
				Object.defineProperty(target.prototype, key, {
					value,
					writable: true,
					configurable: true,
				});
			});
		} catch (error) {
			throw new Error(
				`Error registering global implementation for ${target.name}: ${error}`,
			);
		}
	}
};

export {
	_Global
}