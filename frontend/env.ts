// env.ts
import { defineConfig } from '@julr/vite-plugin-validate-env';
import { z } from 'zod';

export default defineConfig({
  validator: 'zod',
  schema: {
    VITE_API_URL: z
      .string()
      .regex(/^https?:/)
      .url(),
    VITE_COGNITO_USER_POOL_ID: z.string().regex(/^[a-z]{2}-[a-z]+-\d+_[A-Za-z0-9]+$/),
    VITE_COGNITO_CLIENT_ID: z.string().min(25).max(26),
    VITE_MFA_ISSUER: z.string(),
  },
});
