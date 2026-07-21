import { TRecursiveMap } from "./types";

/** A tree of nested `Map`s keyed by a tuple path `P`, storing a bucket of `T` values at each leaf path. */
class PathMap<P extends any[], T> {
	root: TRecursiveMap<P, T> = new Map<any, any>() as any;

	add(path: P, ...values: T[]) {
		let last = path.length - 1;
		let current = this.root;

		path.forEach((part, index) => {
			if (!current.has(part)) {
				if (index !== last) {
					current.set(part, new Map<any, any>() as never);
				} else {
					current.set(part, [] as never);
				}
			}
			current = current.get(part) as any;
		});
		(current as any as T[]).push(...values);
	}

	remove(path: P, value: T) {
		const stack: { parent: Map<any, any>, key: any }[] = [];
		let current: any = this.root;

		for (const part of path) {
			if (!current.has(part)) return;

			stack.push({ parent: current, key: part });
			current = current.get(part);
		}

		const values = current as T[];
		const index = values.indexOf(value);
		
		values.splice(index, 1);

		for (let i = stack.length - 1; i >= 0; i--) {
			const { parent, key } = stack[i];
			const target = parent.get(key);

			const isEmpty = Array.isArray(target)
				? target.length === 0
				: (target instanceof Map && target.size === 0);

			if (isEmpty) {
				parent.delete(key);
			} else {
				break;
			}
		}
	}

	get(path: P): T[] {
		let current = this.root;
		for (let part of path) {
			if (!current.has(part)) {
				return [];
			}
			current = current.get(part) as any;
		}
		return current as any as T[];
	}
}

export {
	PathMap
}