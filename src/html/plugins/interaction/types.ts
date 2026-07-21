/** The state `InteractionPlugin` tracks — focus/touched/dirty, with no notion of validity. */
type TInteractionState = {
	/** O campo está com foco agora. */
	focused: boolean;
	/** O campo já perdeu o foco pelo menos uma vez. */
	touched: boolean;
	/** O valor já mudou pelo menos uma vez. */
	dirty: boolean;
};

export type {
	TInteractionState
}
