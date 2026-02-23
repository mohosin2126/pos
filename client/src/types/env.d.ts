interface ImportMetaEnv {
  VITE_EMAILJS_SERVICE_ID: string | undefined;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
