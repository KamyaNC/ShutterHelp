import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// Phones only allow camera access over HTTPS (localhost is exempt).
// `npm run dev:https` serves a self-signed cert so you can test on a phone over your LAN.
export default defineConfig({
  plugins: [react(), ...(process.env.HTTPS ? [basicSsl()] : [])],
});
