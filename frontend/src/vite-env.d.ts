declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.svg?react' {
  import * as React from 'react';

  const ReactComponent: React.FunctionComponent<React.ComponentProps<'svg'> & { title?: string }>;

  export default ReactComponent;
}
/// <reference types="vite/client" />

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_PDF_URL: string;
  readonly VITE_COGNITO_USER_POOL_ID: string;
  readonly VITE_COGNITO_CLIENT_ID: string;
  readonly VITE_MFA_ISSUER: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
