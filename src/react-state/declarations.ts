import { bitEnum } from "@tsn/bitwise/utils";

const REACT_STATE_FLAGS = bitEnum(
	'DIRTY', // Mudança nas dependências
	'HAS_VALUE', // Computado
	'RUNNING', // Computando
	'QUEUED' // Em fila de notificação
)

export {
	REACT_STATE_FLAGS
}