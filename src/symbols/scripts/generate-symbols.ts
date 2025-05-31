import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { kebabCase, pascalCase } from 'es-toolkit/string';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 元SVG読み込み先
const iconDir = join(__dirname, '../../../node_modules/@material-symbols/svg-400/rounded');
// 出力先
const iconsOutDir = join(__dirname, '../icons');
const indexOutFile = join(iconsOutDir, 'index.ts');
const storyFile = join(__dirname, '../index.stories.tsx');

// SVGファイル取得
const reg = /\.svg$/;
const iconFiles = readdirSync(iconDir)
  .filter((file) => file.endsWith('.svg'))
  .map((file) => file.replace(reg, ''))
  .sort();

// iconsディレクトリがなければ作る
if (!existsSync(iconsOutDir)) {
  mkdirSync(iconsOutDir, { recursive: true });
}

// 各アイコンコンポーネントファイルを作る
for (const name of iconFiles) {
  const pascalName = pascalCase(`rounded_${name}`);
  const fileName = `${kebabCase(name)}.tsx`;

  const content = `\
/**
 * 🚨 自動生成ファイル（編集しないでください）
 * scripts/generate-symbols.ts により生成
 */
import { forwardRef } from 'react';
import type { SVGProps } from 'react';
import RawIcon from '@material-symbols/svg-400/rounded/${name}.svg?react';

export const ${pascalName} = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
  <RawIcon ref={ref} {...props} />
));
`;

  writeFileSync(join(iconsOutDir, fileName), content, 'utf-8');
}

// index.tsを作る
const importLines = iconFiles.map((name) => {
  const pascalName = pascalCase(`rounded_${name}`);
  const fileName = kebabCase(name);
  return `export { ${pascalName} } from './${fileName}';`;
});

writeFileSync(
  indexOutFile,
  `\
/**
 * 🚨 自動生成ファイル（編集しないでください）
 * scripts/generate-symbols.ts により生成
 */
${importLines.join('\n')}
`,
  'utf-8',
);

console.log(`✅ icons ディレクトリに ${iconFiles.length} 個のコンポーネントファイルを生成しました`);

// Storybook用のstoriesファイルを生成
const storyContent = `\
/**
 * 🚨 自動生成ファイル（編集しないでください）
 * scripts/generate-symbols.ts により生成
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './';

const meta: Meta<typeof Icon> = {
  title: 'Symbols/Icon',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  component: Icon,
};

export default meta;

type Story = StoryObj<typeof Icon>;

export const AllIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
    ${iconFiles
      .map((name) => {
        return `  <Icon name="${pascalCase(`rounded_${name}`)}" width={24} height={24} />`;
      })
      .join('\n    ')}
    </div>
  ),
};
`;

writeFileSync(storyFile, storyContent, 'utf-8');
