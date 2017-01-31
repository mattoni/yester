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
  })

  it('should match *', () => {
    const res = match({
      pattern: '/foo/*',
      path: '/foo/bar'
    });
    assert.deepEqual(res, {
      remainingPath: '',
      params: {
        splat: 'bar'
      }
    });
  })

  it('should match **', () => {
    assert.deepEqual(
      match({
        pattern: '/foo/**',
        path: '/foo/bar'
      })
      , {
        remainingPath: '',
        params: {
          splat: 'bar'
        }
      }
    );
  })

  it('should match **', () => {
    assert.deepEqual(
      match({
        pattern: '/foo/**',
        path: '/foo/bar'
      })
      , {
        remainingPath: '',
        params: {
          splat: 'bar'
        }
      }
    );
  });

  it('should match /**/', () => {
    assert.deepEqual(
      match({
        pattern: '/foo/**/baz',
        path: '/foo/bar/baz'
      })
      , {
        remainingPath: '',
        params: {
          splat: 'bar'
        }
      }
    );

    assert.deepEqual(
      match({
        pattern: '/foo/**/baz',
        path: '/foo/bar/baz/baz'
      })
      , {
        remainingPath: '',
        params: {
          splat: 'bar/baz'
        }
      }
    );
  });
});

describe('match invalid', () => {
  it('should not match path too short', () => {
    const res = match({
      pattern: '/foo/bar',
      path: '/foo'
    });
    assert.equal(res, null);
  })
});