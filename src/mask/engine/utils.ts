class MaskEngineUtils {
	/** Inverte o texto por caractere (a máscara da direita para a esquerda trabalha sobre o texto invertido). */
	static reverse(text: string): string {
		return [...text].reverse().join('');
	}
}

export { MaskEngineUtils };
