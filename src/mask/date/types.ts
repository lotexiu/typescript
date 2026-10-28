type TDateOrder = 'ymd' | 'dmy' | 'mdy';
type TMaskDateConfig = Readonly<{ order: TDateOrder; separator?: string }>;

export type { TDateOrder, TMaskDateConfig };
