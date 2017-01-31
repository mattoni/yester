import { match } from '../match';
import * as assert from 'assert';

describe('match', () => {
  it('should match strings', () => {
    const res = match({
      pattern: '/foo/bar',
      pathname: '/foo/bar'
    });
    assert.deepEqual(res, {
      remainingPathname: '',
      params: {}
    });
  });
});
