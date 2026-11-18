import { TAbstractConstructor, TConstructor } from '@tsn-function/types';
import { TKeysType, TMethodKey } from '@tsn-object/types';

/** Reflection over classes and instances: prototype chains, method names, mixins, cloning and binding. */
export class ClassUtils {
	/** Prototypes from the object (or class prototype) up to, not including, `Object.prototype`. */
	static getPrototypeChain(target: object | TConstructor): object[] {
		const chain: object[] = [];
		let current = typeof target === 'function' ? target.prototype : Object.getPrototypeOf(target);

		while (current && current !== Object.prototype) {
			chain.push(current);
			current = Object.getPrototypeOf(current);
		}
		return chain;
	}

	/** Names of every method along the prototype chain, without the constructor and accessors. */
	static getMethodNames<T extends object>(target: T | TConstructor): TMethodKey<T>[] {
		const methods = new Set<TMethodKey<T>>();
		const chain = ClassUtils.getPrototypeChain(target);

		for (const proto of chain) {
			const names = Object.getOwnPropertyNames(proto);
			for (const name of names) {
				if (name === 'constructor') continue;
				const descriptor = Object.getOwnPropertyDescriptor(proto, name);
				if (descriptor && typeof descriptor.value === 'function') {
					methods.add(name as TMethodKey<T>);
				}
			}
		}
		return Array.from(methods);
	}

	/** Names of the getters and setters along the prototype chain. */
	static getAccessors(target: object | TConstructor): { getters: string[]; setters: string[] } {
		const getters = new Set<string>();
		const setters = new Set<string>();
		const chain = ClassUtils.getPrototypeChain(target);

		for (const proto of chain) {
			const descriptors = Object.getOwnPropertyDescriptors(proto);
			for (const [key, descriptor] of Object.entries(descriptors)) {
				if (key === 'constructor') continue;
				if (typeof descriptor.get === 'function') getters.add(key);
				if (typeof descriptor.set === 'function') setters.add(key);
			}
		}

		return {
			getters: Array.from(getters),
			setters: Array.from(setters),
		};
	}

	/** Whether `child` extends `parent`, directly or not. */
	static isSubclassOf<T extends TAbstractConstructor>(
		target: TAbstractConstructor,
		superClass: T
	): boolean {
		let current = target;
		while (current) {
			if (current === superClass) return true;
			current = Object.getPrototypeOf(current);
		}
		return false;
	}

	/** An object with the class prototype but without running the constructor. */
	static instantiateUninitialized<T extends object>(ctor: TConstructor<T>): T {
		return Object.create(ctor.prototype);
	}

	/** A shallow copy keeping the prototype (methods keep working). */
	static cloneInstance<T extends object>(instance: T): T {
		const proto = Object.getPrototypeOf(instance);
		const copy = Object.create(proto);
		return Object.assign(copy, instance);
	}

	/** Copies the methods and accessors of `baseCtors` onto `derivedCtor`'s prototype. */
	static applyMixins(derivedCtor: TConstructor, baseCtors: TConstructor[]): void {
		baseCtors.forEach((baseCtor) => {
			Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
				if (name !== 'constructor') {
					Object.defineProperty(
						derivedCtor.prototype,
						name,
						Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null)
					);
				}
			});
		});
	}

	/** Binds every method to the instance, so they survive being passed around unbound. Returns the instance. */
	static autoBind<T extends object>(instance: T): T {
		const methods = ClassUtils.getMethodNames(instance);
		for (const method of methods) {
			const fn = instance[method];
			if (typeof fn === 'function') {
				instance[method] = fn.bind(instance);
			}
		}
		return instance;
	}
}
