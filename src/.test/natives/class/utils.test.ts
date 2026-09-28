import { describe, it, expect } from 'vitest';
import { ClassUtils } from '@tsn-class/utils';

class Animal {
	sound() {
		return 'generic sound';
	}
	get legs() {
		return 4;
	}
}
class Dog extends Animal {
	bark() {
		return 'woof';
	}
	set name(value: string) {
		(this as any)._name = value;
	}
}

describe('ClassUtils.getPrototypeChain', () => {
	it('walks from the instance prototype up to (excluding) Object.prototype', () => {
		const chain = ClassUtils.getPrototypeChain(new Dog());
		expect(chain).toEqual([Dog.prototype, Animal.prototype]);
	});

	it('accepts a constructor directly', () => {
		const chain = ClassUtils.getPrototypeChain(Dog);
		expect(chain).toEqual([Dog.prototype, Animal.prototype]);
	});

	it('returns an empty chain for a plain object literal', () => {
		expect(ClassUtils.getPrototypeChain({})).toEqual([]);
	});
});

describe('ClassUtils.getMethodNames', () => {
	it('collects own methods across the whole prototype chain, excluding the constructor', () => {
		const names = ClassUtils.getMethodNames(new Dog());
		expect(names.sort()).toEqual(['bark', 'sound']);
	});

	it('does not include getters/setters', () => {
		const names = ClassUtils.getMethodNames(new Dog());
		expect(names).not.toContain('legs');
		expect(names).not.toContain('name');
	});
});

describe('ClassUtils.getAccessors', () => {
	it('separates getters and setters across the prototype chain', () => {
		const { getters, setters } = ClassUtils.getAccessors(new Dog());
		expect(getters).toEqual(['legs']);
		expect(setters).toEqual(['name']);
	});
});

describe('ClassUtils.isSubclassOf', () => {
	it('is true for a direct subclass', () => {
		expect(ClassUtils.isSubclassOf(Dog, Animal)).toBe(true);
	});

	it('is true for the class itself', () => {
		expect(ClassUtils.isSubclassOf(Animal, Animal)).toBe(true);
	});

	it('is false for unrelated classes', () => {
		class Other {}
		expect(ClassUtils.isSubclassOf(Other, Animal)).toBe(false);
	});
});

describe('ClassUtils.instantiateUninitialized', () => {
	it('creates an instance without running the constructor', () => {
		class Loud {
			constructor() {
				throw new Error('should not run');
			}
			bark() {
				return 'woof';
			}
		}
		const instance = ClassUtils.instantiateUninitialized(Loud);
		expect(instance).toBeInstanceOf(Loud);
		expect(instance.bark()).toBe('woof');
	});
});

describe('ClassUtils.cloneInstance', () => {
	it('copies own enumerable properties and keeps the prototype', () => {
		const dog = new Dog();
		(dog as any).name = 'Rex';
		const clone = ClassUtils.cloneInstance(dog);
		expect(clone).not.toBe(dog);
		expect(clone).toBeInstanceOf(Dog);
		expect(clone.bark()).toBe('woof');
		expect((clone as any)._name).toBe('Rex');
	});
});

describe('ClassUtils.applyMixins', () => {
	it('copies method descriptors from base classes onto the derived prototype', () => {
		class CanFly {
			fly() {
				return 'flying';
			}
		}
		class CanSwim {
			swim() {
				return 'swimming';
			}
		}
		class Duck {}
		ClassUtils.applyMixins(Duck, [CanFly, CanSwim]);
		const duck = new Duck() as Duck & CanFly & CanSwim;
		expect(duck.fly()).toBe('flying');
		expect(duck.swim()).toBe('swimming');
	});
});

describe('ClassUtils.autoBind', () => {
	it('binds every method so it keeps its `this` when detached', () => {
		const dog = new Dog();
		ClassUtils.autoBind(dog);
		const detached = dog.bark;
		expect(detached()).toBe('woof');
	});
});
