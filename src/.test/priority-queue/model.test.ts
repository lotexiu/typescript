import { describe, expect, it } from 'vitest';
import { PriorityQueue } from '@ts/priority-queue/model';
import { Random } from '@ts/random/model';

describe('PriorityQueue', () => {
	const ascending = (left: number, right: number) => left - right;

	it('sai em ordem crescente e vazio devolve undefined', () => {
		const queue = new PriorityQueue(ascending, [5, 1, 4, 2, 3]);
		expect(queue.size).toBe(5);
		expect(queue.peek()).toBe(1);
		const out: number[] = [];
		while (!queue.isEmpty) out.push(queue.pop()!);
		expect(out).toEqual([1, 2, 3, 4, 5]);
		expect(queue.pop()).toBeUndefined();
		expect(queue.peek()).toBeUndefined();
	});

	it('empates saem na ordem de chegada (estável)', () => {
		const queue = new PriorityQueue<{ p: number; id: string }>((left, right) => left.p - right.p);
		['a', 'b', 'c', 'd'].forEach((id) => queue.push({ p: 1, id }));
		queue.push({ p: 0, id: 'urgente' });
		expect(queue.toSortedArray().map((entry) => entry.id)).toEqual(['urgente', 'a', 'b', 'c', 'd']);
		expect(queue.size).toBe(5);
	});

	it('bate com Array.sort em entradas aleatórias (semente fixa)', () => {
		const random = new Random(123);
		const values = Array.from({ length: 500 }, () => random.int(0, 100));
		const queue = new PriorityQueue(ascending, values);
		expect(queue.toSortedArray()).toEqual([...values].sort(ascending));
	});

	it('intercala push e pop mantendo a ordem', () => {
		const queue = new PriorityQueue(ascending);
		queue.push(10);
		queue.push(3);
		expect(queue.pop()).toBe(3);
		queue.push(1);
		queue.push(7);
		expect([queue.pop(), queue.pop(), queue.pop()]).toEqual([1, 7, 10]);
	});

	it('clear esvazia', () => {
		const queue = new PriorityQueue(ascending, [1, 2]);
		queue.clear();
		expect(queue.isEmpty).toBe(true);
	});
});
