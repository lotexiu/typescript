import type { Decimal } from './model';

/**
 * Como arredondar quando o resultado não cabe na escala pedida:
 * `up` = para longe do zero · `down` = para o zero (trunca) · `ceil` = para +∞ · `floor` = para −∞ ·
 * `half-up` = meio vai para longe do zero (o "arredonda normal") · `half-down` = meio vai para o zero · `half-even` = meio vai para o par (bancário).
 */
type TRoundingMode = 'up' | 'down' | 'ceil' | 'floor' | 'half-up' | 'half-down' | 'half-even';

type TDecimalInput = Decimal | string | number | bigint;

export type { TRoundingMode, TDecimalInput };
