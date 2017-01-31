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

  it('should match path too long', () => {
    const res = match({
      pattern: '/foo',
      path: '/foo/bar'
    });
    assert.deepEqual(res, {
      remainingPath: '/bar',
      params: {}
    });
  });

`Greedy vs. non-greedy
/*/c matches /you/are/okay/c
/*/c does not match /you/are/cool/c
/**/c matches /you/are/cool/c
`
  it('match *', () => {
    assert.deepEqual(
      match({
        pattern: '/*/c',
        path: '/you/arc/okay/c'
      }), {
        remainingPath: '',
        params: {
          splat: 'you/arc/okay'
        }
      }
    );

    assert.deepEqual(
      match({
        pattern: '/*/c',
        path: '/you/arc/cool/c'
      }), null
    );
  })

  it('should match **', () => {
    assert.deepEqual(
      match({
        pattern: '/foo/**/',
        path: '/foo/bar/bas/'
      })
      , {
        remainingPath: '',
        params: {
          splat: 'bar/bas'
        }
      }
    );
  })

  it('should not match path too short', () => {
    const res = match({
      pattern: '/foo/bar',
      path: '/foo'
    });
    assert.deepEqual(res, null);
  })

  it('should match path if optional', () => {
    const res = match({
      pattern: '/foo(/bar)',
      path: '/foo'
    });
    assert.deepEqual(res, {
      remainingPath: '',
      params: {}
    });
  })
});
