import { describe, expect, it } from 'vitest';
import { Mask } from '@ts/mask/model';

/** Simula o campo: o navegador insere/apaga e põe o cursor; a máscara reformata; `caret` diz onde o cursor fica. */
function edit(mask: ReturnType<typeof Mask.of>, current: string, from: number, to: number, inserted: string) {
	const typed = current.slice(0, from) + inserted + current.slice(to);
	const typedCaret = from + inserted.length;
	const next = mask.apply(typed);
	return { next, caret: mask.caret(typed, typedCaret, next) };
}

describe('caret — máscara da esquerda para a direita', () => {
	const code = Mask.of('0000-0000');

	it('digitar no fim: o cursor acompanha o dado (e pula o literal inserido)', () => {
		expect(edit(code, '1234', 4, 4, '5')).toEqual({ next: '1234-5', caret: 6 });
		expect(edit(code, '123', 3, 3, '4')).toEqual({ next: '1234', caret: 4 });
	});

	it('digitar no meio: o cursor fica logo depois do dígito digitado', () => {
		expect(edit(code, '1234-5678', 2, 2, '9')).toEqual({ next: '1293-4567', caret: 3 });
	});

	it('empurrar um dígito para depois do literal move o cursor junto', () => {
		expect(edit(code, '1234-5678', 4, 4, '9')).toEqual({ next: '1234-9567', caret: 6 });
	});

	it('caractere inválido é descartado e o cursor não anda', () => {
		expect(edit(code, '1234-5678', 2, 2, 'x')).toEqual({ next: '1234-5678', caret: 2 });
	});

	it('apagar o literal não "come" nada e o cursor fica antes dele', () => {
		expect(edit(code, '1234-5678', 4, 5, '')).toEqual({ next: '1234-5678', caret: 4 });
	});

	it('apagar um dígito no meio', () => {
		expect(edit(code, '1234-5678', 1, 2, '')).toEqual({ next: '1345-678', caret: 1 });
	});

	it('colar vários dígitos: o cursor vai para o fim do que foi colado', () => {
		expect(edit(code, '', 0, 0, '12345678')).toEqual({ next: '1234-5678', caret: 9 });
		expect(edit(code, '12', 2, 2, '3456')).toEqual({ next: '1234-56', caret: 7 });
	});

	it('colar texto já formatado e com lixo', () => {
		expect(edit(code, '', 0, 0, ' 1234-5678 ').next).toBe('1234-5678');
	});
});

describe('caret — máscara da direita para a esquerda', () => {
	const thousands = Mask.of({ pattern: '0{1,3}.0{3}.0{3}', reversed: true });
	const money = Mask.number({ scale: 2, decimal: ',', group: '.' });

	it('digitar no fim: cursor no fim', () => {
		expect(edit(thousands, '1.234', 5, 5, '5')).toEqual({ next: '12.345', caret: 6 });
	});

	it('digitar no meio: o cursor conta a partir do fim (fica depois do dígito, mesmo que apareça um ponto)', () => {
		expect(edit(thousands, '12.345', 1, 1, '9')).toEqual({ next: '192.345', caret: 2 });
	});

	it('dinheiro: digitar sempre entra "pela direita"', () => {
		expect(edit(money, '1,23', 4, 4, '4')).toEqual({ next: '12,34', caret: 5 });
		expect(edit(money, '', 0, 0, '5')).toEqual({ next: '0,05', caret: 4 });
	});

	it('dinheiro: apagar o último dígito', () => {
		expect(edit(money, '12,34', 4, 5, '')).toEqual({ next: '1,23', caret: 4 });
	});

	it('dinheiro: apagar um dígito no meio mantém o cursor na mesma distância do fim', () => {
		expect(edit(money, '1.234,56', 0, 1, '')).toEqual({ next: '234,56', caret: 0 });
		expect(edit(money, '1.234,56', 3, 4, '')).toEqual({ next: '124,56', caret: 2 });
	});

	it('dinheiro: apagar o separador não remove dado — o texto volta e o cursor fica antes dos dígitos que seguem', () => {
		expect(edit(money, '1.234,56', 1, 2, '')).toEqual({ next: '1.234,56', caret: 2 });
	});
});

describe('caret — casos de borda', () => {
	it('cursor fora do texto é limitado', () => {
		const code = Mask.of('0000-0000');
		expect(code.caret('12', 99, '12')).toBe(2);
		expect(code.caret('12', -5, '12')).toBe(0);
	});

	it('campo vazio', () => {
		expect(Mask.of('0000-0000').caret('', 0, '')).toBe(0);
		expect(Mask.number({ scale: 2, decimal: ',' }).caret('', 0, '')).toBe(0);
	});
});
