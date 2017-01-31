import { matchPattern } from '../match';

describe('matchPattern', () => {
  it('should match strings', () => {
    console.log(matchPattern('/foo/bar', '/foo/bar'));
  });
});
