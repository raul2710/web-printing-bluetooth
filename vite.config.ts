import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serve o projeto em https://<usuario>.github.io/<repositorio>/
// Se o repositório for renomeado, ajuste o base abaixo.
const base = '/web-printing-bluetooth/';

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
});
