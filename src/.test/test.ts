import { Component } from "@ts/component/model";
import { TChanges } from "@ts/component/types";

class Test extends Component {
	name = 'test';
	id = 5
	date = new Date();

	onChange(changes: TChanges<Test>) {
		console.log(changes);
	}
}


const test = new Test();

test.name = 'test2';
test.id = 6;
test.date = new Date();