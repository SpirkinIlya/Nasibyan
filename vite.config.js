import { defineConfig } from 'vite';
import nunjucks from 'nunjucks';
import { resolve, dirname, join } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = resolve(__dirname, 'src');
const PAGES_DIR = resolve(SRC_DIR, 'pages');

// Load global data once at config time
const globalData = JSON.parse(
  fs.readFileSync(resolve(SRC_DIR, 'data', 'global.json'), 'utf-8')
);

// Nunjucks env: templates root = src/
const njkEnv = nunjucks.configure(SRC_DIR, { noCache: true });

/** Returns { pageName: absolutePathToNjk } for all pages */
function getPages() {
  const pages = {};
  for (const dir of fs.readdirSync(PAGES_DIR)) {
    const njkPath = join(PAGES_DIR, dir, `${dir}.njk`);
    if (fs.existsSync(njkPath)) {
      pages[dir] = njkPath;
    }
  }
  return pages;
}

/** Render a page template with merged global + page data */
function renderPage(pageName) {
  const jsonPath = join(PAGES_DIR, pageName, `${pageName}.json`);
  const pageData = fs.existsSync(jsonPath)
    ? JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    : {};

  // Path relative to SRC_DIR (templatesDir)
  const relPath = `pages/${pageName}/${pageName}.njk`;
  return njkEnv.render(relPath, { global: globalData, page: pageData });
}

/**
 * Custom Vite plugin: Nunjucks multi-page support.
 *
 * DEV:   middleware intercepts URL requests → renders .njk on-the-fly →
 *        passes through server.transformIndexHtml (injects HMR client, handles assets).
 *
 * BUILD: config() hook pre-renders .njk to temp .html files inside src/ at
 *        URL-correct paths (index → src/index.html, name → src/name/index.html),
 *        registers them as rollup inputs so Vite's HTML pipeline processes
 *        <link>/<script> tags and produces hashed assets.
 *        closeBundle() cleans up the temp files.
 *
 * HMR:   full page reload on any .njk or page .json change.
 */
function nunjucksMultiPagePlugin() {
  const tempFiles = [];

  return {
    name: 'nunjucks-multi-page',

    // ── BUILD: pre-render pages to temp HTML files ────────────────────────
    config(_userConfig, { command }) {
      if (command !== 'build') return;

      const pages = getPages();
      const inputs = {};

      for (const [name] of Object.entries(pages)) {
        const html = renderPage(name);

        // Place HTML at the path that will produce the desired output URL:
        //   index → src/index.html → dist/index.html → /
        //   name  → src/name/index.html → dist/name/index.html → /name/
        const tempPath =
          name === 'index'
            ? join(SRC_DIR, 'index.html')
            : join(SRC_DIR, name, 'index.html');

        fs.mkdirSync(dirname(tempPath), { recursive: true });
        fs.writeFileSync(tempPath, html, 'utf-8');
        tempFiles.push(tempPath);

        inputs[name] = tempPath;
      }

      return {
        build: {
          rollupOptions: { input: inputs },
        },
      };
    },

    // ── DEV: serve rendered HTML via middleware ───────────────────────────
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '/').split('?')[0].split('#')[0];
        const pages = getPages();

        for (const [pageName] of Object.entries(pages)) {
          const isMatch =
            pageName === 'index'
              ? url === '/' || url === '/index.html'
              : url === `/${pageName}/` || url === `/${pageName}/index.html`;

          if (isMatch) {
            try {
              const raw = renderPage(pageName);
              // Let Vite inject HMR client and process asset URLs
              const html = await server.transformIndexHtml(url, raw);
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end(html);
            } catch (err) {
              next(err);
            }
            return;
          }
        }

        next();
      });
    },

    // ── CLEANUP: remove temp HTML files after build ───────────────────────
    closeBundle() {
      for (const file of tempFiles) {
        try {
          fs.unlinkSync(file);
          // Remove empty intermediate dirs (e.g. src/contacts/ if it was created)
          const dir = dirname(file);
          if (dir !== SRC_DIR && fs.readdirSync(dir).length === 0) {
            fs.rmdirSync(dir);
          }
        } catch {
          // Ignore cleanup errors
        }
      }
      tempFiles.length = 0;
    },

    // ── HMR: full reload on template or page data changes ────────────────
    handleHotUpdate({ file, server }) {
      if (
        file.endsWith('.njk') ||
        (file.endsWith('.json') && file.startsWith(PAGES_DIR))
      ) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

export default defineConfig({
  root: 'src',
  publicDir: resolve(__dirname, 'public'),

  resolve: {
    alias: {
      '@blocks': resolve(__dirname, 'src/blocks'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@data': resolve(__dirname, 'src/data'),
      '@pages': resolve(__dirname, 'src/pages'),
    },
  },

  plugins: [nunjucksMultiPagePlugin()],

  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },

  server: {
    port: 3000,
  },
});
