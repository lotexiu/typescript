/** How the highlight moves through a list. */
type TNavigationOptions = {
	/** Moving past either end goes around. Default `true`. */
	readonly wrap?: boolean;
	/** Clock used to group typed characters; inject one in tests. */
	readonly now?: () => number;
};

export type { TNavigationOptions };
