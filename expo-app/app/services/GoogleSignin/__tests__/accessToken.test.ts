import { getAccessToken } from '../accessToken';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    getTokens: jest.fn(),
  },
}));

describe('getAccessToken', () => {
  it('should return the access token when getTokens is successful', async () => {
    const mockAccessToken = 'mockAccessToken';
    (GoogleSignin.getTokens as jest.Mock).mockResolvedValue({ accessToken: mockAccessToken });

    const accessToken = await getAccessToken();

    expect(accessToken).toBe(mockAccessToken);
  });

  it('should throw an error when getTokens fails', async () => {
    (GoogleSignin.getTokens as jest.Mock).mockRejectedValue(new Error('Failed to get tokens'));

    await expect(getAccessToken()).rejects.toThrow('Failed to get tokens');
  });
});