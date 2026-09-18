import { TChunkPosition } from './types';

class ChunkUtils {
	bySize<T>(array: readonly T[], size: number): T[][] {
		if (size <= 0) return [];
		const result: T[][] = [];
		for (let i = 0; i < array.length; i += size) {
			result.push(array.slice(i, i + size));
		}
		return result;
	}

	byWorkers<T>(array: readonly T[], workers: number): T[][] {
		if (workers <= 0) return [];
		const chunkSize = Math.ceil(array.length / workers);
		return this.bySize(array, chunkSize);
	}

	bySizeCompact<T>(array: readonly T[], size: number): TChunkPosition[] {
		if (size <= 0) return [];
		const result: TChunkPosition[] = [];
		for (let i = 0; i < array.length; i += size) {
			result.push([i, i + size]);
		}
		return result;
	}

	byWorkersCompact<T>(array: readonly T[], workers: number): TChunkPosition[] {
		if (workers <= 0) return [];
		const chunkSize = Math.ceil(array.length / workers);
		return this.bySizeCompact(array, chunkSize);
	}
}

export { ChunkUtils };
