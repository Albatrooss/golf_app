import { defineConfig } from 'vite';
import { resolve } from 'path';
import reactRefresh from '@vitejs/plugin-react-refresh';

const readConfig = (key: string) => ({
  // eslint-disable-next-line no-process-env
  [`process.env.${key}`]: JSON.stringify(process.env[key]),
});

// https://vitejs.dev/config/
export default defineConfig({
  root: 'client',
  define: {
    ...readConfig('ROLLBAR_LOG_LEVEL'),
    'process.env.ROLLBAR_ENABLED': false,
    ...readConfig('ROLLBAR_ENV'),
    ...readConfig('ROLLBAR_TOKEN'),
    'process.env.USING_WEBPACK_SERVER': false,
    // ...readConfig('FILESTACK_API_KEY'),
  },
  resolve: {
    alias: {
      'filestack-js': require.resolve(
        'filestack-js/build/browser/filestack.esm.js',
      ),
      '@/components': resolve(__dirname, './client/components'),
      '@/contexts': resolve(__dirname, './client/contexts'),
      '@/hooks': resolve(__dirname, './client/hooks'),
      '@/pages': resolve(__dirname, './client/pages'),
      '@/utils': resolve(__dirname, './client/utils'),
      '@/server': resolve(__dirname, './client/server'),
    },
  },
  esbuild: {
    jsxInject: 'import __react from "react"',
    jsxFactory: '__react.createElement',
    jsxFragment: '__react.Fragment',
  },
  plugins: [reactRefresh()],
});
