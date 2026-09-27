import { ReactiveNode } from '../model';

/**
 * @internal
 */
class ReactiveLink {
	prevDependent: ReactiveLink | undefined = undefined;
	nextDependent: ReactiveLink | undefined = undefined;

	constructor(
		public dependency: ReactiveNode<any>,
		public dependent: ReactiveNode<any>,
		public lastReadVersion: number,
		public nextDependency: ReactiveLink | undefined
	) {}
}

export { ReactiveLink };
