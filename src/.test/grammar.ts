import { AhoCorasick } from "@ts/aho-corasick-v2/model";
import { Matrix } from "@ts/matrix/model";
import { StopWatch } from "@ts/stopwatch/model";

console.clear();
const sw = new StopWatch();
sw.totalLaps.set(1_000_000);

// const text = readFileSync('src/natives/string/implementations.ts', 'utf8')
// const text = readFileSync("src/index.ts", "utf8");

const text = "axcxc"
const len = text.length

const ac = AhoCorasick.compile("axv", "xc");
 

ac.scan(text)