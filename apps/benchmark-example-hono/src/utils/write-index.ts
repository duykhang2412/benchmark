import { writeFileSync } from 'fs';
import { glob } from 'glob';
import { join, parse, resolve } from 'path';

const ROOT_DIR = 'src/typings';
const INDEX_PATH = resolve(join(ROOT_DIR, 'index.ts'));

let content = '';

(async () => {
  const files = await glob(`${ROOT_DIR}/**/**/*.ts`);

  for (const file of files) {
    const { dir, name } = parse(file);
    const importPath = `.${dir.replace(ROOT_DIR, '')}/${name}`;
    content += `export *${dir === ROOT_DIR ? ` as ${name}` : ''} from "${importPath}";\n`;
  }

  writeFileSync(INDEX_PATH, content);
})();
