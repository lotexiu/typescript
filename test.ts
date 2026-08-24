import './src/index';
import { Mask } from './src/index';

Mask.init()

const c = new Mask()

c.apply('123456789', 'A{1,5} X{2,3}')