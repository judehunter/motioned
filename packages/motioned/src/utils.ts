import { useRef, useEffect } from 'react';
import { match } from 'ts-pattern';

export const registerCSSProperties = () => {
  try {
    (CSS as any).registerProperty({
      name: '--x',
      syntax: '<length-percentage>',
      inherits: false,
      initialValue: '0px',
    });

    (CSS as any).registerProperty({
      name: '--y',
      syntax: '<length-percentage>',
      inherits: false,
      initialValue: '0px',
    });

    (CSS as any).registerProperty({
      name: '--z',
      syntax: '<length-percentage>',
      inherits: false,
      initialValue: '0px',
    });

    (CSS as any).registerProperty({
      name: '--rotate-x',
      syntax: '<angle>',
      inherits: false,
      initialValue: '0deg',
    });

    (CSS as any).registerProperty({
      name: '--rotate-y',
      syntax: '<angle>',
      inherits: false,
      initialValue: '0deg',
    });

    (CSS as any).registerProperty({
      name: '--rotate-z',
      syntax: '<angle>',
      inherits: false,
      initialValue: '0deg',
    });

    (CSS as any).registerProperty({
      name: '--scale-x',
      syntax: '<number>',
      inherits: false,
      initialValue: '1',
    });

    (CSS as any).registerProperty({
      name: '--scale-y',
      syntax: '<number>',
      inherits: false,
      initialValue: '1',
    });

    (CSS as any).registerProperty({
      name: '--scale-z',
      syntax: '<number>',
      inherits: false,
      initialValue: '1',
    });
  } catch (e) {}
};

export const asSelf = <TOriginal, TCast>(
  original: TOriginal,
  cast: (original: TOriginal) => TCast,
) => original as any as TCast;

export const coerceToCssValue = (
  property: AnimatePropertyName,
  value: string | number,
): string => {
  if (typeof value === 'number') {
    return match(property)
      .with('rotateX', () => `${value}deg`)
      .with('rotateY', () => `${value}deg`)
      .with('rotateZ', () => `${value}deg`)
      .with('width', () => `${value}px`)
      .otherwise(() => `${value}`);
  }
  return value;
};

export type ValueOrKeyframes<T> = T | T[] | [null, ...T[]];

export type AnimateProperties = Partial<{
  opacity: ValueOrKeyframes<number>;
  x: ValueOrKeyframes<number | string>;
  y: ValueOrKeyframes<number | string>;
  z: ValueOrKeyframes<number | string>;
  rotateX: ValueOrKeyframes<number | string>;
  rotateY: ValueOrKeyframes<number | string>;
  rotateZ: ValueOrKeyframes<number | string>;
  scaleX: ValueOrKeyframes<number>;
  scaleY: ValueOrKeyframes<number>;
  scaleZ: ValueOrKeyframes<number>;
  width: ValueOrKeyframes<number | string>;
}>;

export type AnimatePropertyName = keyof AnimateProperties;
const possibleAnimatePropertyNames = [
  'opacity',
  'x',
  'y',
  'z',
  'rotateX',
  'rotateY',
  'rotateZ',
  'scaleX',
  'scaleY',
  'scaleZ',
  'width',
] as const;

export type SpringTransition = {
  easing: 'spring';
  stiffness?: number;
  friction?: number;
  mass?: number;
};

export type Transition =
  | Partial<{
      duration: number;
      delay: number;
      easing:
        | 'linear'
        | 'ease'
        | 'ease-out'
        | 'ease-in'
        | 'ease-in-out'
        | EasingFn;
    }>
  | SpringTransition;

export type AnimateOptions = AnimateProperties & {
  transition?: Transition & Partial<Record<AnimatePropertyName, Transition>>;
};

export type EasingFn = (t: number) => number;

const animateOptionsEqual = (
  a: AnimateOptions,
  b: AnimateOptions | undefined,
) => {
  if (b === undefined) {
    return false;
  }
  for (const prop of possibleAnimatePropertyNames) {
    if (Array.isArray(a[prop]) && Array.isArray(b[prop])) {
    }
    if (Array.isArray(a[prop]) !== Array.isArray(b[prop])) {
      return false;
    }
    if (a[prop] !== b[prop]) {
      return false;
    }
  }
  return true;
};

export const useAnimateOptionsEffect = (
  opts: AnimateOptions,
  cb: (prev: AnimateOptions | undefined) => any,
) => {
  const ref = useRef<AnimateOptions | undefined>();
  const prev = useRef<AnimateOptions | undefined>();

  if (!animateOptionsEqual(opts, ref.current)) {
    prev.current = ref.current;
    ref.current = opts;
  }

  useEffect(() => {
    cb(prev.current);
  }, [ref.current]);
};

export const animatePropertiesToStyle = (properties: AnimateProperties) => {
  return Object.fromEntries(
    Object.entries(properties)
      .map(([_name, valueOrKeyframes]) => {
        const name = matchAnimatePropertyNameToCssPropertyName(
          _name as AnimatePropertyName,
        );

        const value = Array.isArray(valueOrKeyframes)
          ? valueOrKeyframes[0]
          : valueOrKeyframes;
        if (value === null) {
          return undefined;
        }
        return [name, coerceToCssValue(name as AnimatePropertyName, value)];
      })
      .filter((x): x is [AnimatePropertyName, string] => x !== undefined),
  );
};

export type NoInfer<T> = [T][T extends any ? 0 : never];

export type Variants<TVariants extends string = string> = Record<
  TVariants,
  AnimateOptions
>;

export const matchAgainstVariants = <T extends string | AnimateOptions>(
  variants: Variants | undefined,
  key: T,
) => {
  if (typeof key === 'string') {
    if (variants === undefined) {
      throw new Error('Variants not defined');
    }
    if (variants[key] === undefined) {
      throw new Error(`Variant "${key}" not found`);
    }
    return variants[key];
  } else {
    return key as AnimateOptions;
  }
};
/** sample points per second */
const SAMPLE_RESOLUTION = 60;

export const sampleEasingFn = (easingFn: EasingFn, duration: number) => {
  const totalPoints = SAMPLE_RESOLUTION * (duration / 1000);
  let points = [];
  for (let progress = 0; progress < 1; progress += 1 / totalPoints) {
    points.push(easingFn(progress));
  }
  points.push(easingFn(1));
  return points;
};

export const extractNumberFromCssValue = (value: string) => {
  const match = value.match(/^(-?\d*(?:\.\d+)?)(?:.*)$/);
  if (match === null) {
    throw new Error(`Could not extract number from css value "${value}"`);
  }
  return parseFloat(match[1]);
};

/**
 * Converts shorthand properties to the actual css property name.
 * Or otherwise returns unchanged.
 */
export const matchAnimatePropertyNameToCssPropertyName = (
  name: AnimatePropertyName,
) => {
  return match(name as AnimatePropertyName)
    .with('x', () => '--x')
    .with('y', () => '--y')
    .with('z', () => '--z')
    .with('rotateX', () => '--rotate-x')
    .with('rotateY', () => '--rotate-y')
    .with('rotateZ', () => '--rotate-z')
    .with('scaleX', () => '--scale-x')
    .with('scaleY', () => '--scale-y')
    .with('scaleZ', () => '--scale-z')
    .otherwise(() => name);
};

// export const getTransformString = (transforms: string[]) => {
//   return transforms
//     .map((transform) =>
//       match(transform as AnimatePropertyName)
//         .with('x', () => 'translateX(var(--x))')
//         .with('y', () => 'translateY(var(--y))')
//         .with('rotate', () => 'rotate(var(--rotate))')
//         .with('rotateX', () => 'rotateX(var(--rotate-x))')
//         .with('rotateY', () => 'rotateY(var(--rotate-y))')
//         .with('rotateZ', () => 'rotateZ(var(--rotate-z))')
//         .with('scale', () => 'scale(var(--scale))')
//         .with('scaleX', () => 'scaleX(var(--scale-x))')
//         .with('scaleY', () => 'scaleY(var(--scale-y))')
//         .with('scaleZ', () => 'scaleZ(var(--scale-z))')
//         .otherwise(() => {
//           throw new Error('Unknown transform');
//         }),
//     )
//     .join(' ');
// };
