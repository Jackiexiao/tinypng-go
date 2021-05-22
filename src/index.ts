#!/usr/bin/env node

import { Command } from 'commander';
import { stat } from 'fs-extra';
import TinyPng from './TinyPng';
import { getFullPath, findAllImageFile } from './utils';
const packageJson = require('../package.json');

(function main() {
  const program = new Command();
  program
    .version(packageJson.version, '-v, --version', 'how current version')
    .arguments('<file>')
    .option('-o, --output <output>', 'set output path')
    .option('-m, --max [max]', 'max async compress tasks')
    .description('A cli tool to compress image', {
      file: 'input file path',
    })
    .action((file, options) => {
      const { output = file, max = 10 } = options;
      const originPath = getFullPath(file);
      stat(originPath)
        .then(async (stats) => {
          let pendingList;
          if (stats.isDirectory()) {
            pendingList = (await findAllImageFile(originPath)).map((item) => ({
              ...item,
              distPath: item.path.replace(originPath, getFullPath(output)),
            }));
          }
          if (stats.isFile()) {
            pendingList = [
              {
                path: originPath,
                originSize: stats.size,
                distPath: getFullPath(output),
              },
            ];
          }

          const tinyPng = new TinyPng(max);
          tinyPng.setPendingList(pendingList);
          tinyPng.run();
        })
        .catch((err) => {
          console.log(err);
        });
    });

  program.parse();
})();
