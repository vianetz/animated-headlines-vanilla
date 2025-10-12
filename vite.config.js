import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy'
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    viteStaticCopy({
      targets: [
        { src: 'dist/*', dest: resolve(__dirname, 'demo/dist/') }
      ]
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/js/animated-headline.ts'),
      name: 'AnimatedHeadline',
      fileName: 'animated-headline', // the proper extensions will be added
    },
    rollupOptions: {
      // Ensure no external dependencies unless you explicitly want to
      external: [],
    },
  }
});
