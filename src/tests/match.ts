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

  it('should match strings ending with :params', () => {
    const res = match({
      pattern: '/foo/:bar',
      path: '/foo/bar'
    });
    assert.deepEqual(res, {
      remainingPath: '',
      params: {
        bar: 'bar'
      }
    });
  });

  it('should match strings containing :params', () => {
    const res = match({
      pattern: '/foo/:bar/baz',
      path: '/foo/bar/baz'
    });
    assert.deepEqual(res, {
      remainingPath: '',
      params: {
        bar: 'bar'
      }
    });
  });

  it('should match strings containing n :params', () => {
    const res = match({
      pattern: '/foo/:bar/:baz',
      path: '/foo/bar/baz'
    });
    assert.deepEqual(res, {
      remainingPath: '',
      params: {
        bar: 'bar',
        baz: 'baz'
      }
    });
  });
});
