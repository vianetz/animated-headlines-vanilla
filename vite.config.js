import {defineConfig} from 'vite';
import {resolve} from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [
        tsconfigPaths()
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/js/animated-headline.ts'),
            name: 'AnimatedHeadline',
            fileName: 'animated-headline', // the proper extensions will be added
        },
        rollupOptions: {
            external: [],
        },
    },
    esbuild: {
        legalComments: 'eof'
    }
});
