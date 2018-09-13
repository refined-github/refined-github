import test from 'ava';
import './fixtures/globals';
import {getSearchableWords as fn} from '../source/features/display-issue-suggestions';

test('Searchable words filter', t => {
	t.deepEqual(fn(' n o t h i n g	n e s s'), []);
	t.deepEqual(fn('Hello, world!'), ['Hello', 'world']);
	t.deepEqual(fn(' 400  	[error] is\\ nonsense !'), ['400', 'error', 'nonsense']);
	t.deepEqual(fn('1col is broken'), ['1col', 'broken']);
	t.deepEqual(fn('ava is 🔥🔥🔥'), ['ava']);
	t.deepEqual(fn('1身 分'), ['1身', '分']);
	t.deepEqual(fn('làm 7/2 nộp'), ['làm', 'nộp']);
	t.deepEqual(fn('测试'), ['测试']);
	t.deepEqual(fn('حمید'), ['حمید']);
	t.deepEqual(fn('테스트'), ['테스트']);
});
