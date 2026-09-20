import { defineConfig } from 'vite';
import nunjucks from 'nunjucks';
import { resolve, dirname, join, posix } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SRC_DIR = resolve(__dirname, 'src');
const PAGES_DIR = resolve(SRC_DIR, 'pages');
const BLOCKS_DIR = resolve(SRC_DIR, 'blocks');
const GLOBAL_DATA_PATH = resolve(SRC_DIR, 'data', 'global.json');

const njkEnv = nunjucks.configure(SRC_DIR, {
  noCache: true,
});

// GitHub Pages: https://spirkinilya.github.io/Nasibyan/
// Locally: /
const BASE_URL = process.env.GITHUB_ACTIONS ? '/Nasibyan/' : '/';

function getGlobalData() {
  if (!fs.existsSync(GLOBAL_DATA_PATH)) {
    return {};
  }

  return JSON.parse(
    fs.readFileSync(GLOBAL_DATA_PATH, 'utf-8')
  );
}

function getPages() {
  const pages = {};

  if (!fs.existsSync(PAGES_DIR)) {
    return pages;
  }

  for (const dir of fs.readdirSync(PAGES_DIR)) {
    const njkPath = join(
      PAGES_DIR,
      dir,
      `${dir}.njk`
    );

    if (fs.existsSync(njkPath)) {
      pages[dir] = njkPath;
    }
  }

  return pages;
}

function renderPagesIndex() {
  const pages = getPages();

  const links = Object.keys(pages)
    .sort()
    .map(
      (pageName) => `
        <li>
          <a href="${BASE_URL}${pageName}/">${pageName}</a>
        </li>
      `
    )
    .join('');

  return `
<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >
  <title>Страницы проекта</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 40px;
      font-family: Arial, sans-serif;
      color: #1a1a1a;
      background: #f5f5f5;
    }

    main {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 32px;
      background: #fff;
      border-radius: 12px;
    }

    h1 {
      margin: 0 0 24px;
      font-size: 32px;
      line-height: 1.2;
    }

    ul {
      display: grid;
      gap: 12px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    a {
      display: block;
      padding: 16px 20px;
      color: inherit;
      text-decoration: none;
      background: #f5f5f5;
      border-radius: 8px;
      transition: background-color 0.2s ease;
    }

    a:hover {
      background: #e9e9e9;
    }
  </style>
</head>

<body>
  <main>
    <h1>Страницы проекта</h1>

    <ul>
      ${links}
    </ul>
  </main>
</body>
</html>
`;
}

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

function resolveTemplateReference(
  reference,
  currentTemplate
) {
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

function getBlockAssets(blockName) {
  const blockDir = join(
    BLOCKS_DIR,
    blockName
  );

  const scssFile = join(
    blockDir,
    `${blockName}.scss`
  );

  const cssFile = join(
    blockDir,
    `${blockName}.css`
  );

  const jsFile = join(
    blockDir,
    `${blockName}.js`
  );

  let style = null;

  if (fs.existsSync(scssFile)) {
    style = `/blocks/${blockName}/${blockName}.scss`;
  } else if (fs.existsSync(cssFile)) {
    style = `/blocks/${blockName}/${blockName}.css`;
  }

  return {
    css: style,

    js: fs.existsSync(jsFile)
      ? `/blocks/${blockName}/${blockName}.js`
      : null,
  };
}

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

function injectBlockAssets(
  html,
  entryTemplate
) {
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

  const globalData = getGlobalData();

  const relativeTemplate =
    `pages/${pageName}/${pageName}.njk`;

  const html = njkEnv.render(
    relativeTemplate,
    {
      global: globalData,
      page: pageData,
      base: BASE_URL,
    }
  );

  return injectBlockAssets(
    html,
    relativeTemplate
  );
}

function getHtmlId(pageName) {
  return join(
    SRC_DIR,
    pageName,
    'index.html'
  );
}

function nunjucksMultiPagePlugin() {
  const htmlIdToPage = new Map();

  const pagesIndexId = join(
    SRC_DIR,
    'index.html'
  );

  let buildMode = false;

  return {
    name: 'nunjucks-multi-page',
    enforce: 'pre',

    config(_, { command }) {
      buildMode = command === 'build';

      if (!buildMode) {
        return;
      }

      const pages = getPages();

      const inputs = {
        __pages_index__: pagesIndexId,
      };

      for (const [pageName] of Object.entries(pages)) {
        const htmlId = getHtmlId(pageName);

        htmlIdToPage.set(
          htmlId,
          pageName
        );

        inputs[pageName] = htmlId;
      }

      return {
        build: {
          rollupOptions: {
            input: inputs,
          },
        },
      };
    },

    resolveId(id) {
      if (!buildMode) {
        return;
      }

      if (id === pagesIndexId) {
        return id;
      }

      if (htmlIdToPage.has(id)) {
        return id;
      }
    },

    load(id) {
      if (!buildMode) {
        return;
      }

      if (id === pagesIndexId) {
        return renderPagesIndex();
      }

      if (htmlIdToPage.has(id)) {
        const pageName =
          htmlIdToPage.get(id);

        return renderPage(pageName);
      }
    },

    configureServer(server) {
      server.middlewares.use(
        async (req, res, next) => {
          const url = (req.url || '/')
            .split('?')[0]
            .split('#')[0];

          if (
            url === '/' ||
            url === '/index.html'
          ) {
            try {
              const raw =
                renderPagesIndex();

              const html =
                await server.transformIndexHtml(
                  '/',
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

          const pages = getPages();

          for (
            const [pageName]
            of Object.entries(pages)
          ) {
            const isMatch =
              url === `/${pageName}/` ||
              url ===
              `/${pageName}/index.html`;

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

    handleHotUpdate({ file, server }) {
      const isTemplate =
        file.endsWith('.njk');

      const isPageJson =
        file.endsWith('.json') &&
        file.startsWith(PAGES_DIR);

      const isGlobalJson =
        file === GLOBAL_DATA_PATH;

      if (
        isTemplate ||
        isPageJson ||
        isGlobalJson
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

  // GitHub Pages: https://spirkinilya.github.io/Nasibyan/
  // Locally: /
  base: BASE_URL,

  publicDir: resolve(
    __dirname,
    'public'
  ),

  resolve: {
    alias: {
      '@blocks': resolve(
        SRC_DIR,
        'blocks'
      ),

      '@assets': resolve(
        SRC_DIR,
        'assets'
      ),

      '@styles': resolve(
        SRC_DIR,
        'styles'
      ),

      '@data': resolve(
        SRC_DIR,
        'data'
      ),

      '@pages': resolve(
        SRC_DIR,
        'pages'
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

    cssCodeSplit: true,

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
