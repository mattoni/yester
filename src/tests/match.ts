import { match } from '../match';
import * as assert from 'assert';

describe('match', () => {
  it('should match strings', () => {
    const res = match({
      pattern: '/foo/bar',
      path: '/foo/bar'
    });
    assert.deepEqual(res, {
      remainingPath: '',
      params: {}
    });
  });
});
