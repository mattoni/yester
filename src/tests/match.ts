import { matchPattern } from '../match';

describe('matchPattern', () => {
  it('should match strings', () => {
    const res = matchPattern({
      pattern: '/foo/bar/:bas',
      pathname: '/foo/bar/bas'
    });
    console.log(res);
  });
});
