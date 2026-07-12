import type { SVGProps } from 'react';
import {
  siDocker,
  siNestjs,
  siNextdotjs,
  siPostgresql,
  siPrisma,
  siRedis,
  siSocketdotio,
  siStripe,
  siTurborepo,
  siTypescript,
} from 'simple-icons';
import type { StackTechId } from './landing-data';

interface SimpleIconData {
  path: string;
}

const ICONS: Record<StackTechId, SimpleIconData> = {
  nestjs: siNestjs,
  nextjs: siNextdotjs,
  prisma: siPrisma,
  postgresql: siPostgresql,
  redis: siRedis,
  stripe: siStripe,
  socketio: siSocketdotio,
  docker: siDocker,
  turborepo: siTurborepo,
  typescript: siTypescript,
};

interface TechStackIconProps extends SVGProps<SVGSVGElement> {
  id: StackTechId;
  color: string;
}

export function TechStackIcon({ id, color, className, ...props }: TechStackIconProps) {
  const icon = ICONS[id];
  if (!icon) {
    return null;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
      fill={`#${color}`}
      {...props}
    >
      <path d={icon.path} />
    </svg>
  );
}
