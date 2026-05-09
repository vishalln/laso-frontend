import { getOAuthConfig } from '@/constants/auth';

export const cognitoConfig = {
  UserPoolId: 'ap-south-1_p92hcT3Pq',
  ClientId: '21dg2fimfv9ep1oj5kvf34b9m2',
  Region: 'ap-south-1',
  OAuth: getOAuthConfig(),
};

export const getCognitoConfig = () => ({
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || cognitoConfig.UserPoolId,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || cognitoConfig.ClientId,
  Region: import.meta.env.VITE_AWS_REGION || cognitoConfig.Region,
  OAuth: cognitoConfig.OAuth,
});
