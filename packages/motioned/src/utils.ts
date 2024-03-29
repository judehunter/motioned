import { useRef, useEffect } from 'react';
import { P, match } from 'ts-pattern';
import type * as CSSType from 'csstype';

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

// This is explicitly defined here so that we can use all these properties
// in the `AnimateProperties` type.
// All of these properties can be set to a number in `animate`.
const coerceMatchers = [
  [['rotateX', 'rotateY', 'rotateZ'], (value: number) => `${value}deg`],
  [
    ['width', 'height', 'top', 'left', 'right', 'bottom', 'x', 'y', 'z'],
    (value: number) => `${value}px`,
  ],
] as const;

type CoerciblePropertyNames = (typeof coerceMatchers)[number][0][number];

/**
 * Coerce a property value from a number to a CSS value using
 * some standardized unit.
 * E.g. `width: 100` becomes `width: '100px'`.
 */
export const coerceToCssValue = (
  property: AnimatePropertyName,
  value: string | number | undefined,
): string | undefined => {
  if (typeof value === 'number') {
    return coerceMatchers
      .reduce((acc, [matcher, fn]) => {
        return acc.with(P.union(...matcher), () => fn(value)) as any;
      }, match(property))
      .otherwise(() => `${value}`);
  }
  return value;
};

export type ValueOrKeyframes<T> = T | T[] | [null, ...T[]];

/**
 * This type specifies all the properties that can be animated with their basic type.
 */
type SingleAnimateProperties = CSSType.StandardProperties &
  CSSType.SvgProperties & {
    x: string | number;
    y: string | number;
    z: string | number;
    rotateX: string | number;
    rotateY: string | number;
    rotateZ: string | number;
    scaleX: string | number;
    scaleY: string | number;
    scaleZ: string | number;
    skewX: string | number;
    skewY: string | number;
  };

/**
 * Adds keyframes support to all properties, as well as coercing.
 */
export type AnimateProperties = Omit<
  Partial<{
    [K in keyof SingleAnimateProperties]: ValueOrKeyframes<
      | SingleAnimateProperties[K]
      | (K extends CoerciblePropertyNames ? number : never)
    >;
  }>,
  `transition${string}`
>;

export type AnimatePropertyName = keyof AnimateProperties;

export type PredefinedEasing = keyof typeof PREDEFINED_EASINGS;

export type TweenEasing =
  | 'linear'
  | 'ease'
  | 'ease-out'
  | 'ease-in'
  | 'ease-in-out'
  | 'step-start'
  | 'step-end'
  | PredefinedEasing
  | EasingFn
  | [number, number, number, number];

export type SpringTransition = {
  easing: 'spring';
  stiffness?: number;
  friction?: number;
  mass?: number;
  restDistance?: number;
  restVelocity?: number;
  delay?: number;
};

export type TweenTransition = {
  easing?: TweenEasing | TweenEasing[];
  duration?: number;
  delay?: number;
  times?: number[];
};

export type Transition = TweenTransition | SpringTransition;

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
  for (const prop of [
    ...new Set([...Object.keys(a), ...Object.keys(b)]),
  ] as AnimatePropertyName[]) {
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
        const name = matchAnimatePropertyNameToCssVariableName(
          _name as AnimatePropertyName,
        );

        const value = Array.isArray(valueOrKeyframes)
          ? valueOrKeyframes[0]
          : valueOrKeyframes;
        if (value === null) {
          return undefined;
        }
        return [name, coerceToCssValue(_name as AnimatePropertyName, value)];
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
 * Converts shorthand properties to the actual css variable name.
 * Or otherwise returns unchanged.
 */
export const matchAnimatePropertyNameToCssVariableName = (
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
    .with('skewX', () => '--skew-x')
    .with('skewY', () => '--skew-y')
    .otherwise(() => name);
};

export const kebabize = (str: string) =>
  str.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? '-' : '') + $.toLowerCase(),
  );

export const PREDEFINED_EASINGS = {
  'circ-in': [0.55, 0, 1, 0.45],
  'circ-out': [0, 0.55, 0.45, 1],
  'circ-in-out': [0.85, 0, 0.15, 1],
  'back-in': [0.36, 0, 0.66, -0.56],
  'back-out': [0.34, 1.56, 0.64, 1],
  'back-in-out': [0.68, -0.6, 0.32, 1.6],
} as const;

/**
 * Maps a single easing to a css easing function.
 */
export const mapEasing = (easing: TweenEasing, duration: number) => {
  const mapped =
    typeof easing === 'string' && easing in PREDEFINED_EASINGS
      ? PREDEFINED_EASINGS[easing as PredefinedEasing]
      : easing;

  if (typeof easing === 'function') {
    return `linear(${sampleEasingFn(easing, duration).join(',')})`;
  }
  if (Array.isArray(mapped)) {
    return bezierDefinitionToEasing(mapped);
  }
  return mapped;
};

/**
 * Same as `mapEasing` but can also handle a list of easings.
 */
export const mapEasingOrEasingList = (
  easingOrEasingList: TweenEasing | TweenEasing[],
  duration: number,
  times: number[] | undefined,
) => {
  if (
    Array.isArray(easingOrEasingList) &&
    typeof easingOrEasingList[0] !== 'number'
  ) {
    const easingList = easingOrEasingList as TweenEasing[];

    const timesArray =
      times ?? easingList.map((_, i) => i / (easingList.length - 1));
    return [
      easingList.map((easing, i) => {
        const durationForEasing =
          duration * (timesArray[i + 1] - timesArray[i]);
        return mapEasing(easing, durationForEasing);
      }),
      timesArray,
    ];
  }
  const easing = easingOrEasingList as TweenEasing;
  return [mapEasing(easing, duration), undefined];
};

export const bezierDefinitionToEasing = (
  definition: [number, number, number, number],
) => {
  if (definition.length !== 4) {
    throw new Error(
      `Invalid bezier easing definition. Expected 4 numbers, got ${definition.length}`,
    );
  }
  return `cubic-bezier(${definition.join(',')})`;
};

export const stripTransition = <
  T extends AnimateOptions | AnimateProperties | undefined,
>(
  x: T,
): Omit<T, 'transition'> => {
  const { transition, ...rest }: any = x ?? {};
  return rest;
};

/**
 * Given a list of transition objects,
 * applies them from left to right by spreading,
 * and resetting if the easing type (spring or not spring) changes.
 */
export const reduceTransitionInheritance = (
  tree: (TweenTransition | SpringTransition | undefined)[],
) => {
  return tree.reduce((acc, cur) => {
    if (!acc) {
      return cur;
    }
    if (cur) {
      // TODO:
      // if (
      //   (cur.easing === 'spring' && acc.easing !== 'spring') ||
      //   (cur.easing !== 'spring' && acc.easing === 'spring')
      // ) {
      //   return cur;
      // }
      return {
        ...acc,
        ...cur,
      };
    }
    return acc;
  }, undefined as TweenTransition | SpringTransition | undefined);
};
