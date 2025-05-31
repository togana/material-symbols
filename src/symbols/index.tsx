import { ark } from '@ark-ui/react';
import type { SVGProps } from 'react';
import * as icons from './icons';

export type IconName = keyof typeof icons;
type IconProps = Partial<SVGProps<SVGSVGElement>> & {
  name: IconName;
};

export const Icon = ({ name, ...props }: IconProps) => {
  const IconComponent = icons[name];
  return (
    <ark.svg asChild={true} role="graphics-symbol" {...props}>
      <IconComponent />
    </ark.svg>
  );
};
