import test from 'ava';
import fn from '../source/libs/compare-versions';

test('Compare versions', t => {
	t.is(-1, fn('1', '2'));
	t.is(-1, fn('v1', '2'));
	t.is(-1, fn('1.1', '1.2'));
	t.is(-1, fn('1', '1.1'));
	t.is(-1, fn('1', '1.0.1'));
	t.is(-1, fn('2.0', '10.0'));
	t.is(-1, fn('1.2.3', '1.22.3'));
	t.is(-1, fn('1.1.1.1.1', '1.1.1.1.2'));
	t.is(-1, fn('r1', 'r2'));
});

test.failing('Support beta versions', t => {
	t.is(-1, fn('1.0-beta', '1.0'));
	t.is(-1, fn('v2.0-RC4', 'v2.0'));
});
