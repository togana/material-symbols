import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { kebabCase, pascalCase } from 'es-toolkit/string';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [100, 200, 300, 400, 500, 600, 700] as const;
const styles = ['rounded', 'sharp', 'outlined'] as const;

// 出力先
const iconsOutDir = join(__dirname, '../icons');
const indexOutFile = join(iconsOutDir, 'index.ts');
const storyOutDir = join(__dirname, '../');

// iconsディレクトリがなければ作る
if (!existsSync(iconsOutDir)) {
  mkdirSync(iconsOutDir, { recursive: true });
}

// 各サイズのディレクトリを作成
for (const size of sizes) {
  const sizeDir = join(iconsOutDir, size.toString());
  if (!existsSync(sizeDir)) {
    mkdirSync(sizeDir, { recursive: true });
  }
  for (const style of styles) {
    const styleDir = join(sizeDir, style);
    if (!existsSync(styleDir)) {
      mkdirSync(styleDir, { recursive: true });
    }
  }
}

// 各スタイルのSVGファイルを取得
const iconFiles = new Set<string>();
for (const size of sizes) {
  for (const style of styles) {
    const iconDir = join(__dirname, `../../../node_modules/@material-symbols/svg-${size}/${style}`);
    const reg = /\.svg$/;
    const files = readdirSync(iconDir)
      .filter((file) => file.endsWith('.svg'))
      .map((file) => file.replace(reg, ''))
      .sort();
    files.forEach((file) => iconFiles.add(file));
  }
}

// 各アイコンコンポーネントファイルを作る
for (const size of sizes) {
  for (const style of styles) {
    for (const name of iconFiles) {
      const pascalName = pascalCase(name);
      const fileName = `${kebabCase(name)}.tsx`;
      const sizeDir = join(iconsOutDir, size.toString(), style);

      const content = `\
/**
 * 🚨 自動生成ファイル（編集しないでください）
 * scripts/generate-symbols.ts により生成
 */
import { forwardRef } from 'react';
import type { SVGProps } from 'react';
import RawIcon from '@material-symbols/svg-${size}/${style}/${name}.svg?react';

export const ${pascalName} = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
  <RawIcon ref={ref} {...props} />
));
`;

      writeFileSync(join(sizeDir, fileName), content, 'utf-8');
    }
  }
}

// index.tsを作る
const importLines: string[] = [];
for (const size of sizes) {
  for (const style of styles) {
    for (const name of iconFiles) {
      const pascalName = pascalCase(`${style}_${name}`);
      importLines.push(`export { ${pascalName} } from './${size}/${style}/${kebabCase(name)}';`);
    }
  }
}

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

console.log(
  `✅ icons ディレクトリに ${importLines.length} 個のコンポーネントファイルを生成しました`,
);

// Storybook用のstoriesファイルを生成
for (const size of sizes) {
  for (const style of styles) {
    const storyContent = `\
/**
 * 🚨 自動生成ファイル（編集しないでください）
 * scripts/generate-symbols.ts により生成
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '../../index';

const meta: Meta<typeof Icon> = {
  title: 'Symbols/Icon/${size}/${style}',
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
    ${Array.from(iconFiles)
      .map((name) => {
        return `  <Icon name="${pascalCase(`${style}_${name}`)}" size={${size}} style="${style}" width={24} height={24} />`;
      })
      .join('\n    ')}
    </div>
  ),
};
`;

    const storyDir = join(storyOutDir, size.toString(), style);
    // storyディレクトリがなければ作る
    if (!existsSync(storyDir)) {
      mkdirSync(storyDir, { recursive: true });
    }
    const storyFile = join(storyDir, 'index.stories.tsx');
    writeFileSync(storyFile, storyContent, 'utf-8');
  }
}
