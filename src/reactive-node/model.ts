import { LocaleError } from '@ts/locale/error';
import { TListeners, TValueListener, TValueUnsubscribe } from '@ts/subscription/types';
import { ListenerUtils } from '@ts/subscription/utils';
import { NODE_FLAGS, SIGNAL_LOCALES } from './declarations';
import { ReactiveLink } from './link/model';
import { TEqual } from './types';

const { DIRTY, MUST_RECOMPUTE, HAS_VALUE, COMPUTING, QUEUED } = NODE_FLAGS;

let activeDependent: ReactiveNode<any> | null = null;
let writeCount = 0;
let computeCount = 0;
let batchDepth = 0;
let notifying = false;
const pendingNotifications: (ReactiveNode<any> | undefined)[] = [];
const dirtyMarkStack: (ReactiveLink | undefined)[] = [];

/**
 * @internal
 */
class ReactiveNode<T> {
	#value: T;
	readonly #compute: (() => T) | undefined;
	readonly #equal: TEqual<T>;
	#flags: number;

	#version = 0;
	#checkedAtWriteCount = -1;
	#notifiedVersion = -1;
	#computeId = 0;
	#linkedInComputeId = 0;

	#dependencies: ReactiveLink | undefined = undefined;
	#dependenciesTail: ReactiveLink | undefined = undefined;
	#dependents: ReactiveLink | undefined = undefined;
	#dependentsTail: ReactiveLink | undefined = undefined;
	#listeners: TListeners<T> = undefined;

	private constructor(value: T, compute: (() => T) | undefined, equal: TEqual<T>) {
		this.#value = value;
		this.#compute = compute;
		this.#equal = equal;
		this.#flags = compute === undefined ? HAS_VALUE : MUST_RECOMPUTE;
	}

	static source<T>(value: T, equal: TEqual<T> = Object.is): ReactiveNode<T> {
		return new ReactiveNode(value, undefined, equal);
	}

	static computed<T>(compute: () => T, equal: TEqual<T> = Object.is): ReactiveNode<T> {
		return new ReactiveNode(undefined as T, compute, equal);
	}

	read(): T {
		if (this.#compute !== undefined && this.#checkedAtWriteCount !== writeCount) this.#refresh();
		if (activeDependent !== null) ReactiveNode.#link(this);
		return this.#value;
	}

	readUntracked(): T {
		if (this.#compute !== undefined && this.#checkedAtWriteCount !== writeCount) this.#refresh();
		return this.#value;
	}

	#refresh(): void {
		if (this.#checkedAtWriteCount === writeCount) return;
		const flags = this.#flags;
		if (flags & COMPUTING) throw new LocaleError(SIGNAL_LOCALES, 'cycle');
		const upToDate = !(flags & DIRTY) && this.#isObserved();
		if (!upToDate && (flags & MUST_RECOMPUTE || this.#dependenciesChanged())) this.#recompute();
		this.#flags &= ~DIRTY;
		this.#checkedAtWriteCount = writeCount;
	}

	#recompute(): void {
		const previousDependent = activeDependent;
		activeDependent = this;
		this.#dependenciesTail = undefined;
		this.#computeId = ++computeCount;
		this.#flags |= COMPUTING;
		let next: T;
		let unchanged = false;
		try {
			next = this.#compute!();
			activeDependent = null;
			unchanged = (this.#flags & HAS_VALUE) !== 0 && this.#equal(this.#value, next);
		} catch (error) {
			this.#flags = (this.#flags & ~COMPUTING) | MUST_RECOMPUTE;
			this.#checkedAtWriteCount = -1;
			throw error;
		} finally {
			activeDependent = previousDependent;
			this.#dropUnreadDependencies();
		}
		this.#flags = (this.#flags & ~(COMPUTING | MUST_RECOMPUTE)) | HAS_VALUE;
		if (unchanged) return;
		this.#value = next;
		this.#version++;
	}

	#dependenciesChanged(): boolean {
		for (let link = this.#dependencies; link !== undefined; link = link.nextDependency) {
			const dependency = link.dependency;
			if (link.lastReadVersion !== dependency.#version) return true;
			if (dependency.#compute !== undefined) dependency.#refresh();
			if (link.lastReadVersion !== dependency.#version) return true;
		}
		return false;
	}

	static #link(dependency: ReactiveNode<any>): void {
		const dependent = activeDependent!;
		const computeId = dependent.#computeId;
		if (dependency.#linkedInComputeId === computeId) return;
		dependency.#linkedInComputeId = computeId;

		const tail = dependent.#dependenciesTail;
		const reusable = tail !== undefined ? tail.nextDependency : dependent.#dependencies;
		if (reusable !== undefined && reusable.dependency === dependency) {
			reusable.lastReadVersion = dependency.#version;
			dependent.#dependenciesTail = reusable;
			return;
		}

		const link = new ReactiveLink(dependency, dependent, dependency.#version, reusable);
		if (tail !== undefined) tail.nextDependency = link;
		else dependent.#dependencies = link;
		dependent.#dependenciesTail = link;
		if (dependent.#isObserved()) dependency.#addDependent(link);
	}

	#dropUnreadDependencies(): void {
		const tail = this.#dependenciesTail;
		let unread = tail !== undefined ? tail.nextDependency : this.#dependencies;
		if (unread === undefined) return;
		if (this.#isObserved()) {
			while (unread !== undefined) unread = ReactiveNode.#removeDependent(unread);
		}
		if (tail !== undefined) tail.nextDependency = undefined;
		else this.#dependencies = undefined;
	}

	#isObserved(): boolean {
		return this.#dependents !== undefined || this.#listeners !== undefined;
	}

	#addDependent(link: ReactiveLink): void {
		const wasObserved = this.#isObserved();
		const tail = this.#dependentsTail;
		link.prevDependent = tail;
		link.nextDependent = undefined;
		if (tail !== undefined) tail.nextDependent = link;
		else this.#dependents = link;
		this.#dependentsTail = link;
		if (!wasObserved) this.#watchDependencies();
	}

	#watchDependencies(): void {
		for (let link = this.#dependencies; link !== undefined; link = link.nextDependency) {
			link.dependency.#addDependent(link);
		}
	}

	#unwatchDependencies(): void {
		let link = this.#dependencies;
		while (link !== undefined) link = ReactiveNode.#removeDependent(link);
	}

	static #removeDependent(link: ReactiveLink): ReactiveLink | undefined {
		const dependency = link.dependency;
		const { prevDependent, nextDependent, nextDependency } = link;
		link.prevDependent = link.nextDependent = undefined;
		if (nextDependent !== undefined) nextDependent.prevDependent = prevDependent;
		else dependency.#dependentsTail = prevDependent;
		if (prevDependent !== undefined) prevDependent.nextDependent = nextDependent;
		else {
			dependency.#dependents = nextDependent;
			if (!dependency.#isObserved()) dependency.#unwatchDependencies();
		}
		return nextDependency;
	}

	write(next: T): boolean {
		if (activeDependent !== null) throw new LocaleError(SIGNAL_LOCALES, 'writeInComputed');
		if (this.#equal(this.#value, next)) return false;
		this.#value = next;
		this.#changed();
		return true;
	}

	notify(): void {
		if (activeDependent !== null) throw new LocaleError(SIGNAL_LOCALES, 'writeInComputed');
		this.#changed();
	}

	#changed(): void {
		this.#version++;
		writeCount++;
		if (this.#listeners !== undefined) this.#queueNotification();
		ReactiveNode.#markDependentsDirty(this);
		ReactiveNode.#runNotifications();
	}

	static #markDependentsDirty(source: ReactiveNode<any>): void {
		const stack = dirtyMarkStack;
		let top = 0;
		let link = source.#dependents;
		for (;;) {
			while (link !== undefined) {
				const dependent = link.dependent;
				if (!(dependent.#flags & DIRTY)) {
					dependent.#flags |= DIRTY;
					if (dependent.#listeners !== undefined) dependent.#queueNotification();
					if (dependent.#dependents !== undefined) {
						stack[top++] = link.nextDependent;
						link = dependent.#dependents;
						continue;
					}
				}
				link = link.nextDependent;
			}
			if (top === 0) return;
			link = stack[--top];
			stack[top] = undefined;
		}
	}

	#queueNotification(): void {
		if (this.#flags & QUEUED) return;
		this.#flags |= QUEUED;
		pendingNotifications.push(this);
	}

	static #runNotifications(): void {
		if (batchDepth > 0 || notifying) return;
		notifying = true;
		const errors: unknown[] = [];
		try {
			for (let index = 0; index < pendingNotifications.length; index++) {
				const node = pendingNotifications[index]!;
				pendingNotifications[index] = undefined;
				node.#flags &= ~QUEUED;
				try {
					node.#notifyListeners(errors);
				} catch (error) {
					errors.push(error);
				}
			}
		} finally {
			pendingNotifications.length = 0;
			notifying = false;
		}
		ListenerUtils.throwAll(errors);
	}

	#notifyListeners(errors: unknown[]): void {
		if (this.#listeners === undefined) return;
		if (this.#compute !== undefined) {
			this.#refresh();
			if (this.#version === this.#notifiedVersion) return;
			this.#notifiedVersion = this.#version;
		}
		ListenerUtils.call(this.#listeners, this.#value, errors);
	}

	subscribe(listener: TValueListener<T>): TValueUnsubscribe {
		const wasObserved = this.#isObserved();
		if (this.#compute !== undefined && this.#listeners === undefined) {
			this.#refresh();
			this.#notifiedVersion = this.#version;
		}
		this.#listeners = ListenerUtils.add(this.#listeners, listener);
		if (!wasObserved) this.#watchDependencies();
		let subscribed = true;
		return () => {
			if (!subscribed) return;
			subscribed = false;
			this.#unsubscribe(listener);
		};
	}

	#unsubscribe(listener: TValueListener<T>): void {
		this.#listeners = ListenerUtils.remove(this.#listeners, listener);
		if (!this.#isObserved()) this.#unwatchDependencies();
	}

	dispose(): void {
		if (this.#isObserved()) this.#unwatchDependencies();
		this.#listeners = undefined;
		this.#dependencies = this.#dependenciesTail = undefined;
		this.#dependents = this.#dependentsTail = undefined;
		if (this.#compute !== undefined) this.#flags |= MUST_RECOMPUTE;
		this.#checkedAtWriteCount = -1;
	}

	static untracked<R>(fn: () => R): R {
		const previousDependent = activeDependent;
		activeDependent = null;
		try {
			return fn();
		} finally {
			activeDependent = previousDependent;
		}
	}

	static batch<R>(fn: () => R): R {
		batchDepth++;
		try {
			return fn();
		} finally {
			batchDepth--;
			ReactiveNode.#runNotifications();
		}
	}
}

export { ReactiveNode };
