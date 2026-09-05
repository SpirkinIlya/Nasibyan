import { defineConfig } from 'vite';
import nunjucks from 'nunjucks';
import { resolve, dirname, join, posix } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SRC_DIR = resolve(__dirname, 'src');
const PAGES_DIR = resolve(SRC_DIR, 'pages');
const BLOCKS_DIR = resolve(SRC_DIR, 'blocks');

// Load global data once at config time
const globalData = JSON.parse(
  fs.readFileSync(resolve(SRC_DIR, 'data', 'global.json'), 'utf-8')
);

// Nunjucks env: templates root = src/
const njkEnv = nunjucks.configure(SRC_DIR, {
  noCache: true,
});

/**
 * Returns:
 *
 * {
 *   index: "/absolute/path/src/pages/index/index.njk",
 *   contacts: "/absolute/path/src/pages/contacts/contacts.njk"
 * }
 */
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

/**
 * Finds static Nunjucks template dependencies:
 *
 * {% extends "layouts/base.njk" %}
 * {% include "blocks/foo/foo.njk" %}
 * {% import "blocks/foo/foo.njk" as foo %}
 * {% from "blocks/foo/foo.njk" import foo %}
 *
 * Dynamic expressions are intentionally not parsed.
 */
function getTemplateDependencies(source) {
  const dependencies = new Set();

  const patterns = [
    /\{%\s*extends\s+["']([^"']+)["'][^%]*%\}/g,
    /\{%\s*include\s+["']([^"']+)["'][^%]*%\}/g,
    /\{%\s*import\s+["']([^"']+)["'][^%]*%\}/g,
    /\{%\s*from\s+["']([^"']+)["']\s+import\b[^%]*%\}/g,
  ];

  for (const pattern of patterns) {
    let match;

    while ((match = pattern.exec(source)) !== null) {
      dependencies.add(match[1]);
    }
  }

  return [...dependencies];
}

/**
 * Resolves template references.
 *
 * Supports:
 *
 * blocks/header/header.njk
 *
 * as well as:
 *
 * ./partial.njk
 * ../shared/shared.njk
 */
function resolveTemplateReference(reference, currentTemplate) {
  if (
    reference.startsWith('./') ||
    reference.startsWith('../')
  ) {
    return posix.normalize(
      posix.join(
        posix.dirname(currentTemplate),
        reference
      )
    );
  }

  return posix.normalize(reference);
}

/**
 * Recursively walks through all templates used by a page.
 *
 * Example:
 *
 * page.njk
 * -> layouts/base.njk
 * -> blocks/header/header.njk
 * -> blocks/logo/logo.njk
 */
function collectTemplateGraph(entryTemplate) {
  const visited = new Set();

  function visit(templatePath) {
    const normalized = posix.normalize(templatePath);

    if (visited.has(normalized)) {
      return;
    }

    const absolutePath = resolve(
      SRC_DIR,
      normalized
    );

    if (!fs.existsSync(absolutePath)) {
      console.warn(
        `[nunjucks] Template not found: ${normalized}`
      );

      return;
    }

    visited.add(normalized);

    const source = fs.readFileSync(
      absolutePath,
      'utf-8'
    );

    const dependencies =
      getTemplateDependencies(source);

    for (const dependency of dependencies) {
      const resolvedDependency =
        resolveTemplateReference(
          dependency,
          normalized
        );

      visit(resolvedDependency);
    }
  }

  visit(entryTemplate);

  return [...visited];
}

/**
 * Converts template paths into block names.
 *
 * blocks/header/header.njk -> header
 * blocks/logo/logo.njk     -> logo
 */
function getBlocksFromTemplateGraph(templates) {
  const blocks = new Set();

  for (const template of templates) {
    const match = template.match(
      /^blocks\/([^/]+)\//
    );

    if (match) {
      blocks.add(match[1]);
    }
  }

  return [...blocks];
}

/**
 * Finds the CSS and JS belonging to a block.
 *
 * Convention:
 *
 * blocks/header/header.njk
 * blocks/header/header.css
 * blocks/header/header.js
 *
 * CSS and JS are optional.
 */
function getBlockAssets(blockName) {
  const blockDir = join(
    BLOCKS_DIR,
    blockName
  );

  const cssFile = join(
    blockDir,
    `${blockName}.css`
  );

  const jsFile = join(
    blockDir,
    `${blockName}.js`
  );

  return {
    css: fs.existsSync(cssFile)
      ? `/blocks/${blockName}/${blockName}.css`
      : null,

    js: fs.existsSync(jsFile)
      ? `/blocks/${blockName}/${blockName}.js`
      : null,
  };
}

/**
 * Creates one inline Vite module containing all block imports.
 *
 * Example:
 *
 * import "/blocks/logo/logo.css";
 * import "/blocks/header/header.css";
 * import "/blocks/header/header.js";
 */
function createBlockAssetsModule(blocks) {
  const imports = [];

  for (const blockName of blocks) {
    const assets = getBlockAssets(blockName);

    if (assets.css) {
      imports.push(
        `import ${JSON.stringify(assets.css)};`
      );
    }

    if (assets.js) {
      imports.push(
        `import ${JSON.stringify(assets.js)};`
      );
    }
  }

  if (imports.length === 0) {
    return '';
  }

  return [
    '<script type="module" data-block-assets>',
    imports.join('\n'),
    '</script>',
  ].join('\n');
}

/**
 * Finds all blocks required by the page and injects
 * their CSS/JS imports into the rendered HTML.
 */
function injectBlockAssets(html, entryTemplate) {
  const templateGraph =
    collectTemplateGraph(entryTemplate);

  const blocks =
    getBlocksFromTemplateGraph(templateGraph);

  const assetsModule =
    createBlockAssetsModule(blocks);

  if (!assetsModule) {
    return html;
  }

  if (html.includes('</head>')) {
    return html.replace(
      '</head>',
      `  ${assetsModule}\n</head>`
    );
  }

  return `${assetsModule}\n${html}`;
}

/**
 * Render a page template with merged global + page data.
 */
function renderPage(pageName) {
  const jsonPath = join(
    PAGES_DIR,
    pageName,
    `${pageName}.json`
  );

  const pageData = fs.existsSync(jsonPath)
    ? JSON.parse(
      fs.readFileSync(jsonPath, 'utf-8')
    )
    : {};

  const relPath =
    `pages/${pageName}/${pageName}.njk`;

  const html = njkEnv.render(
    relPath,
    {
      global: globalData,
      page: pageData,
    }
  );

  return injectBlockAssets(
    html,
    relPath
  );
}

/**
 * Custom Vite plugin:
 * Nunjucks multi-page support + automatic block assets.
 *
 * DEV:
 * URL -> Nunjucks render -> block dependency analysis ->
 * Vite transformIndexHtml.
 *
 * BUILD:
 * Nunjucks pages are pre-rendered to temporary HTML files.
 * Vite then handles module imports, CSS extraction and hashing.
 *
 * HMR:
 * Nunjucks and page JSON changes trigger full reload.
 * CSS/JS block files are handled by normal Vite HMR.
 */
function nunjucksMultiPagePlugin() {
  const tempFiles = [];

  return {
    name: 'nunjucks-multi-page',

    // BUILD
    config(_userConfig, { command }) {
      if (command !== 'build') {
        return;
      }

      const pages = getPages();
      const inputs = {};

      for (const [name] of Object.entries(pages)) {
        const html = renderPage(name);

        const tempPath =
          name === 'index'
            ? join(SRC_DIR, 'index.html')
            : join(
              SRC_DIR,
              name,
              'index.html'
            );

        fs.mkdirSync(
          dirname(tempPath),
          {
            recursive: true,
          }
        );

        fs.writeFileSync(
          tempPath,
          html,
          'utf-8'
        );

        tempFiles.push(tempPath);

        inputs[name] = tempPath;
      }

      return {
        build: {
          rollupOptions: {
            input: inputs,
          },
        },
      };
    },

    // DEV
    configureServer(server) {
      server.middlewares.use(
        async (req, res, next) => {
          const url = (req.url || '/')
            .split('?')[0]
            .split('#')[0];

          const pages = getPages();

          for (
            const [pageName] of Object.entries(pages)
          ) {
            const isMatch =
              pageName === 'index'
                ? url === '/' ||
                url === '/index.html'
                : url === `/${pageName}/` ||
                url === `/${pageName}/index.html`;

            if (!isMatch) {
              continue;
            }

            try {
              const raw =
                renderPage(pageName);

              const html =
                await server.transformIndexHtml(
                  url,
                  raw
                );

              res.setHeader(
                'Content-Type',
                'text/html; charset=utf-8'
              );

              res.end(html);
            } catch (error) {
              next(error);
            }

            return;
          }

          next();
        }
      );
    },

    // CLEANUP
    closeBundle() {
      for (const file of tempFiles) {
        try {
          fs.unlinkSync(file);

          const dir = dirname(file);

          if (
            dir !== SRC_DIR &&
            fs.existsSync(dir) &&
            fs.readdirSync(dir).length === 0
          ) {
            fs.rmdirSync(dir);
          }
        } catch {
          // Ignore cleanup errors
        }
      }

      tempFiles.length = 0;
    },

    // HMR
    handleHotUpdate({ file, server }) {
      if (
        file.endsWith('.njk') ||
        (
          file.endsWith('.json') &&
          file.startsWith(PAGES_DIR)
        )
      ) {
        server.ws.send({
          type: 'full-reload',
        });

        return [];
      }
    },
  };
}

export default defineConfig({
  root: 'src',

  publicDir: resolve(
    __dirname,
    'public'
  ),

  resolve: {
    alias: {
      '@blocks': resolve(
        __dirname,
        'src/blocks'
      ),

      '@assets': resolve(
        __dirname,
        'src/assets'
      ),

      '@styles': resolve(
        __dirname,
        'src/styles'
      ),

      '@data': resolve(
        __dirname,
        'src/data'
      ),

      '@pages': resolve(
        __dirname,
        'src/pages'
      ),
    },
  },

  plugins: [
    nunjucksMultiPagePlugin(),
  ],

  build: {
    outDir: resolve(
      __dirname,
      'dist'
    ),

    emptyOutDir: true,

    rollupOptions: {
      output: {
        entryFileNames:
          'assets/[name]-[hash].js',

        chunkFileNames:
          'assets/[name]-[hash].js',

        assetFileNames:
          'assets/[name]-[hash][extname]',
      },
    },
  },

  server: {
    port: 3000,
  },
});