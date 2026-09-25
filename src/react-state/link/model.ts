type TLinkValue = {
	version: number;
};

class Link<T extends TLinkValue> {
	prevConsumer: Link<T> | undefined = undefined;
	nextConsumer: Link<T> | undefined = undefined;

	constructor(
		public producer: T,
		public consumer: T,
		public readVersion: number,
		public nextDependency: Link<T> | undefined
	) {}

	static dependenciesChanged(root: Link<TLinkValue>) {
		for (let link = root.nextDependency; link !== undefined; link = link.nextDependency) {
			if (link.readVersion !== link.producer.version) return true;
		}
		return false;
	}
}
