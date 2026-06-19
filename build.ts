#!/usr/bin/env bun

import fs from 'fs';

const allowedTargets = ['connector-chrome', 'app'];

const allowedBuildTargets = [
  'linux-x64',
  'linux-arm64',
  'darwin-x64',
  'darwin-arm64',
];

const printUsage = (): void =>
  console.log(`
Usage: build.ts <target> <build-target>

Available targets:
  ${allowedTargets.join('\n  ')}

Available build targets:
  ${allowedBuildTargets.join('\n  ')}
`);

const [target, buildTarget] = process.argv.slice(2);
try {
  if (!target) {
    throw new Error('No target specified.');
  }
  if (!allowedTargets.includes(target)) {
    throw new Error(`Invalid target: ${target}`);
  }
  if (target === 'app') {
    if (!buildTarget) {
      throw new Error('No build target specified.');
    }
    if (!allowedBuildTargets.includes(buildTarget)) {
      throw new Error(`Invalid build target: ${buildTarget}`);
    }
  }
} catch (e) {
  console.log(`ERROR: ${e.message}`);
  printUsage();
  process.exit(1);
}

let version: string = '0.0.0';
try {
  version = (
    target === 'app'
      ? JSON.parse(fs.readFileSync('./tui-app/package.json', 'utf8'))
      : JSON.parse(
          fs.readFileSync('./tui-connector-chrome/manifest.json', 'utf8'),
        )
  ).version;
} catch (e) {
  console.log(`ERROR: Could not read version: ${e.message}`);
  process.exit(1);
}

const buildDate = new Date().toISOString();

console.log(`Building ${target} version ${version}...`);

const buildConfigs: { [key in 'connector-chrome' | 'app']: Bun.BuildConfig } = {
  ['connector-chrome']: {
    entrypoints: [
      './tui-connector-chrome/src/index.ts',
      './tui-connector-chrome/src/popup/popup.ts',
    ],
    define: {
      '__VERSION__': JSON.stringify(version),
      '__BUILD_DATE__': JSON.stringify(buildDate),
    },
    outdir: './tui-connector-chrome/dist',
    target: 'browser',
    sourcemap: 'linked',
    minify: true,
  },
  app: {
    entrypoints: ['./tui-app/src/index.ts'],
    define: {
      '__VERSION__': JSON.stringify(version),
      '__BUILD_DATE__': JSON.stringify(buildDate),
    },
    compile: {
      target: `bun-${buildTarget}` as Bun.Build.CompileTarget,
      outfile: `bookmarks-tui-${buildTarget}`,
    },
    sourcemap: 'none',
  },
};

(async () => {
  try {
    const buildOutput = await Bun.build(buildConfigs[target]);
    console.log(`${buildOutput.success ? 'Success' : 'Failed'}`);
    console.log(buildOutput.logs.join('\n'));
    if (!buildOutput.success) {
      process.exit(1);
    }
    if (target === 'connector-chrome') {
      // Copy popup.html next to the bundled popup.js
      fs.copyFileSync(
        './tui-connector-chrome/src/popup/popup.html',
        './tui-connector-chrome/dist/popup/popup.html',
      );

      // Copy icons into dist/
      const iconDir = './tui-connector-chrome/dist/icon';
      if (!fs.existsSync(iconDir)) {
        fs.mkdirSync(iconDir, { recursive: true });
      }
      for (const file of fs.readdirSync('./tui-connector-chrome/icon')) {
        fs.copyFileSync(
          `./tui-connector-chrome/icon/${file}`,
          `${iconDir}/${file}`,
        );
      }

      // Write manifest with paths adjusted for dist/ being the extension root
      const manifest = JSON.parse(
        fs.readFileSync('./tui-connector-chrome/manifest.json', 'utf8'),
      );
      manifest.action.default_popup = 'popup/popup.html';
      manifest.background.service_worker = 'index.js';
      for (const [size, path] of Object.entries(manifest.icons)) {
        manifest.icons[size] = (path as string).replace(/^.*\//, 'icon/');
      }
      fs.writeFileSync(
        './tui-connector-chrome/dist/manifest.json',
        JSON.stringify(manifest, null, 2) + '\n',
      );
    }
    const githubOutput = process.env.GITHUB_OUTPUT;
    if (githubOutput) {
      fs.appendFileSync(githubOutput, `version=${version}\n`);
    }
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
    process.exit(1);
  }
})();
