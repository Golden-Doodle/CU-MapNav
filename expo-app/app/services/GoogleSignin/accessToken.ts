import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const getAccessToken = async () => {
  // getTokens() refreshes the access token if it has expired
  const { accessToken } = await GoogleSignin.getTokens();
  return accessToken;
};
