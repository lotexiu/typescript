import { TChunkPosition } from './types';

/** Splits arrays into chunks, either copying them or returning only the index ranges. */
class ChunkUtils {
	/** Chunks of `size` items (the last may be shorter). */
	static bySize<T>(array: readonly T[], size: number): T[][] {
		if (size <= 0) return [];
		const result: T[][] = [];
		for (let i = 0; i < array.length; i += size) {
			result.push(array.slice(i, i + size));
		}
		return result;
	}

	/** As many chunks as `workers`, as even as possible. */
	static byWorkers<T>(array: readonly T[], workers: number): T[][] {
		if (workers <= 0) return [];
		const chunkSize = Math.ceil(array.length / workers);
		return ChunkUtils.bySize(array, chunkSize);
	}

	/** Index ranges of `bySize`, without copying. */
	static bySizeCompact<T>(array: readonly T[], size: number): TChunkPosition[] {
		if (size <= 0) return [];
		const result: TChunkPosition[] = [];
		for (let i = 0; i < array.length; i += size) {
			result.push([i, i + size]);
		}
		return result;
	}

	/** Index ranges of `byWorkers`, without copying. */
	static byWorkersCompact<T>(array: readonly T[], workers: number): TChunkPosition[] {
		if (workers <= 0) return [];
		const chunkSize = Math.ceil(array.length / workers);
		return ChunkUtils.bySizeCompact(array, chunkSize);
	}
}

export { ChunkUtils };
