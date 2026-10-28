import { Semaphore } from '../semaphore/model';

/** Exclusão mútua assíncrona: um `Semaphore` de 1 permissão. */
class Mutex extends Semaphore {
	constructor() {
		super(1);
	}

	get locked(): boolean {
		return this.available === 0;
	}
}

export { Mutex };
