import './src/index';
import { Mask } from './src/index';

Mask.init()

const c = new Mask()

// c.apply('06797639964', 'A{3}.A{3}.A{3}-0{2}')
console.log(c.unapply('0.6.7.9.7.6.3-9-9-6-4', 'A{3}.A{3}.A{3}-0{2}'))
console.log(c.unapply('435h90.6.7.9.7.6.3-9-9-6-41c#T$%', 'A{3}.A{3}.A{3}-0{2}'))