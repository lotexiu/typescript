/** Ordem de ano (`y`), mês (`m`) e dia (`d`). */
type TDateOrder = 'ymd' | 'dmy' | 'mdy';
/** Configuração de `Mask.date`: ordem e separador. */
type TMaskDateConfig = Readonly<{ order: TDateOrder; separator?: string }>;

export type { TDateOrder, TMaskDateConfig };
