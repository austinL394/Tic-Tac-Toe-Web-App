import { z } from 'zod';
import { defineConfig } from '@julr/vite-plugin-validate-env';

const schema = z.object({
  VITE_API_URL: z.string().url().min(1),
});

export default defineConfig({
  validator: 'zod',
  schema,
});
