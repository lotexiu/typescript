import { TReactive } from '@tsr-node/types';
import { TColor } from '../color/types';
import { TThemeMode } from '../types';

type SlotColor = {
	readonly id: string;
	readonly value: TReactive<TColor>;
};

/** Tone (`0..100`) a role takes in each mode; `readable` also emits `on<Role>` — the palette's best text color over it. */
type TRoleSpec = Readonly<Record<TThemeMode, number>> & { readonly readable?: boolean };

/** Role name → how it is picked from a palette. */
type TRoleScheme = Readonly<Record<string, TRoleSpec>>;

/** Resolved colors of one slot, by role name. */
type TRoles = Record<string, TColor>;

export type { SlotColor, TRoleSpec, TRoleScheme, TRoles };
