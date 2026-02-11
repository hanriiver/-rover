const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

fs.mkdirSync('dist', { recursive: true });

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

function copyStatic() {
  fs.copyFileSync('src/manifest.json', 'dist/manifest.json');
  copyDir('src/popup', 'dist/popup');
  copyDir('src/sprites', 'dist/sprites');
  copyDir('src/icons', 'dist/icons');
  copyDir('src/styles', 'dist/styles');
}

copyStatic();

const buildOptions = {
  bundle: true,
  format: 'iife',
  target: 'chrome100',
};

async function build() {
  await esbuild.build({
    ...buildOptions,
    entryPoints: ['src/content.js'],
    outfile: 'dist/content.js',
  });

  await esbuild.build({
    ...buildOptions,
    entryPoints: ['src/background.js'],
    outfile: 'dist/background.js',
  });

  console.log('Build complete');
}

if (isWatch) {
  const chokidar = { watch: null };
  build().then(() => {
    console.log('Watching for changes...');
    const rebuild = async () => {
      try {
        copyStatic();
        await build();
      } catch (e) {
        console.error('Build error:', e.message);
      }
    };
    fs.watch('src', { recursive: true }, () => {
      rebuild();
    });
  });
} else {
  build();
}
