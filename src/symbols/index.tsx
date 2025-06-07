import { ark } from '@ark-ui/react';
import type { SVGProps } from 'react';
import * as icons from './icons';

export type IconName = keyof typeof icons;
export type IconSize = 100 | 200 | 300 | 400 | 500 | 600 | 700;
export type IconStyle = 'rounded' | 'sharp' | 'outlined';

type IconProps = Partial<SVGProps<SVGSVGElement>> & {
  name: IconName;
  size?: IconSize;
  style?: IconStyle;
};

export const Icon = ({ name, size = 400, style = 'rounded', ...props }: IconProps) => {
  const iconName = `${style}_${name}` as IconName;
  const IconComponent = icons[iconName];
  return (
    <ark.svg asChild={true} role="graphics-symbol" {...props}>
      <IconComponent />
    </ark.svg>
  );
};
