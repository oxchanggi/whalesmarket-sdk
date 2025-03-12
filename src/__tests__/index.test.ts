import { WhalesSDK } from '../index';

describe('WhalesSDK', () => {
  let sdk: WhalesSDK;

  beforeEach(() => {
    sdk = new WhalesSDK('test-api-key');
  });

  it('should be initialized with an API key', () => {
    expect(sdk).toBeInstanceOf(WhalesSDK);
  });

  it('should return the correct version', () => {
    expect(sdk.getVersion()).toBe('0.1.0');
  });
}); 