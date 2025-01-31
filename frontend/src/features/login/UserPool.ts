import { CognitoUserPool } from 'amazon-cognito-identity-js';

const pool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
  Storage: window.sessionStorage,
});

export default pool;
