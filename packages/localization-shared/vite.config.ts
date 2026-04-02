import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  plugins: [dts({ rollupTypes: false })],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        client: path.resolve(__dirname, 'src/client.ts'),
        'react/index': path.resolve(__dirname, 'src/react/index.ts'),
        'react-native/index': path.resolve(__dirname, 'src/react-native/index.ts')
      },
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-query', '@tanstack/react-query', 'axios', 'react-native', '@react-native-async-storage/async-storage'],
      output: {
        globals: {
          react: 'React',
          'react-native': 'ReactNative',
          '@tanstack/react-query': 'ReactQuery',
          axios: 'axios'
        }
      }
    },
    ssr: false
  }
});
