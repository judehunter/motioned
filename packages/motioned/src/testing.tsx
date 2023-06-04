import React, {
  ComponentProps,
  ForwardedRef,
  MutableRefObject,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { match } from 'ts-pattern';

type ValueOrKeyframes<T> = T | T[] | [null, ...T[]];

type AnimateProperties = Partial<{
  opacity: ValueOrKeyframes<number>;
  // x: ValueOrKeyframes<number | string>;
  // y: ValueOrKeyframes<number | string>;
  rotate: ValueOrKeyframes<number | string>;
  translate: ValueOrKeyframes<string>;
  scale: ValueOrKeyframes<number>;
  width: ValueOrKeyframes<number | string>;
}>;

type AnimatePropertyName = keyof AnimateProperties;
const possibleAnimatePropertyNames = [
  'opacity',
  // 'x',
  // 'y',
  'rotate',
  'translate',
  'scale',
  'width',
] as const;

type SpringTransition = {
  easing: 'spring';
  stiffness?: number;
  friction?: number;
  mass?: number;
};

type Transition =
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

type EasingFn = (t: number) => number;

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

function useAnimateOptionsEffect(
  opts: AnimateOptions,
  cb: (prev: AnimateOptions | undefined) => any,
) {
  const ref = useRef<AnimateOptions | undefined>();
  const prev = useRef<AnimateOptions | undefined>();

  if (!animateOptionsEqual(opts, ref.current)) {
    prev.current = ref.current;
    ref.current = opts;
  }

  useEffect(() => {
    cb(prev.current);
  }, [ref.current]);
}

const coerceToCssValue = (
  property: AnimatePropertyName,
  value: string | number,
): string => {
  if (typeof value === 'number') {
    const match = {
      opacity: () => `${value}`,
      translate: () => `${value}`,
      rotate: () => `${value}deg`,
      scale: () => `${value}`,
      width: () => `${value}px`,
    };
    return match[property]();
  }
  return value;
};

const animatePropertiesToStyle = (properties: AnimateProperties) => {
  return Object.fromEntries(
    Object.entries(properties)
      .map(([name, valueOrKeyframes]) => {
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

type NoInfer<T> = [T][T extends any ? 0 : never];

type Variants<TVariants extends string = string> = Record<
  TVariants,
  AnimateOptions
>;

const matchAgainstVariants = <T extends string | AnimateOptions>(
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

const sampleEasingFn = (easingFn: EasingFn, duration: number) => {
  const totalPoints = SAMPLE_RESOLUTION * (duration / 1000);
  let points = [];
  for (let progress = 0; progress < 1; progress += 1 / totalPoints) {
    points.push(easingFn(progress));
  }
  points.push(easingFn(1));
  return points;
};

// tagged template function to extract values from complex css values
const prepare = (strings: TemplateStringsArray, ...values: string[]) => {
  return {
    strings,
    values,
  };
};

// // join into one string
// const css = strings.reduce((acc, str, i) => {
//   return acc + str + (values[i] ?? '');
// }

/**
 * interpolate between two css values using calc
 * @param t should be between 0 and 1, inclusive
 */
// const interpolateWithCalc = (a: string, b: string, t: number) => {
//   if (t === 0) {
//     return a;
//   }
//   if (t === 1) {
//     return b;
//   }
//   return `calc((${a}) + ((${b}) - (${a})) * ${t})`;
// };

// const interpolatePrepared = (prepared: {
//   strings: TemplateStringsArray;
//   values: string[];
// }) => {
//   const { strings, values } = prepared;
//   const interpolatedValues = values.map((value) => interpolateWithCalc(value));

// };

/**
 * returns a sample for a spring
 * @param stiffness k in Hooke's law
 * @param friction damping
 */
const sampleSpring = ({
  stiffness,
  friction,
  mass,
}: {
  stiffness: number;
  friction: number;
  mass: number;
}) => {
  // x is normalized to be |a - b| = 1,
  // since the spring is an easing function,
  // and so it returns values 0 through 1.
  let x = 1;
  let velocity = 0;

  // how often to sample, in seconds
  const INVERSE_SAMPLE_RESOLUTION = 1 / SAMPLE_RESOLUTION;
  const MAX_TIME = 10;

  let points = [0];
  let lastDisplacement = 0;
  let time = 0;
  for (; time < MAX_TIME; time += INVERSE_SAMPLE_RESOLUTION) {
    const acceleration = (-stiffness * x - friction * velocity) / mass;
    velocity += acceleration * INVERSE_SAMPLE_RESOLUTION;
    const displacement = velocity * INVERSE_SAMPLE_RESOLUTION;
    x += displacement;
    points.push(1 - x);

    // check if we've reached an inflection point,
    // and break if it's close enough to the equilibrium
    let DELTA = 0.01;
    if (displacement * lastDisplacement < 0 && Math.abs(x) < DELTA) {
      break;
    }
    lastDisplacement = displacement;
  }
  points.push(1);

  return { duration: time * 1000, points };
};

const asSelf = <TOriginal, TCast>(
  original: TOriginal,
  cast: (original: TOriginal) => TCast,
) => original as any as TCast;

const DEFAULT_DURATION = 500;
const useAnimation = (
  elem: MutableRefObject<HTMLElement>,
  animate: AnimateOptions,
  variants: Variants | undefined,
) => {
  const currentAnimSet = useRef<Animation[] | undefined>(undefined);
  const matchedAnimate = matchAgainstVariants(variants, animate);
  // const state = useRef();

  useAnimateOptionsEffect(matchedAnimate, async () => {
    // cancel previous animation set and commit styles
    for (const currentAnim of currentAnimSet.current ?? []) {
      currentAnim.commitStyles();
      currentAnim.cancel();
    }

    // clear previous animation set
    currentAnimSet.current = [];

    // split transition and properties
    const { transition: _transition, ...properties } = matchedAnimate;

    // get current computed styles
    const computedStyles = window.getComputedStyle(elem.current);

    /**
     * Get the current value of a property from the computed styles
     */
    const getCurrentValue = (property: string) => {
      return computedStyles.getPropertyValue(property);
    };

    // loop over properties and create animations,
    // one for each property
    for (const [name, valueOrKeyframes] of Object.entries(properties)) {
      // if the property is defined as keyframes, use them,
      // otherwise use the current value as the first keyframe.
      // if the first keyframe is null, use the current value as the first keyframe.
      const _rawKeyframes = Array.isArray(valueOrKeyframes)
        ? valueOrKeyframes[0] === null
          ? [getCurrentValue(name), ...valueOrKeyframes.slice(1)]
          : valueOrKeyframes
        : [getCurrentValue(name), valueOrKeyframes];
      const rawKeyframes = _rawKeyframes as (string | number)[];

      // map non-css convenience values to css values,
      // e.g. 0 -> '0px' for translate
      const keyframes = rawKeyframes.map((value) =>
        coerceToCssValue(name as AnimatePropertyName, value!),
      );

      const transition =
        _transition?.[name as AnimatePropertyName] ?? _transition;

      let easing = asSelf(
        transition?.easing ?? 'ease-in-out',
        (self) => self as typeof self | (string & {}),
      );

      let duration: number;
      if (transition?.easing === 'spring') {
        const stiffness = transition?.stiffness ?? 100;
        const friction = transition?.friction ?? 10;
        const mass = transition?.mass ?? 1;
        const spring = sampleSpring({
          stiffness,
          friction,
          mass,
        });
        easing = (t: number) =>
          spring.points[Math.floor((spring.points.length - 1) * t)];
        duration = spring.duration;
      } else {
        duration = transition?.duration ?? DEFAULT_DURATION;
      }

      if (typeof easing === 'function') {
        easing = `linear(${sampleEasingFn(easing, duration).join(',')})`;
      }

      console.log(easing);

      console.log(keyframes);

      // create and start animation
      const anim = elem.current.animate(
        keyframes.map((keyframe) => ({
          [name]: keyframe,
          easing: typeof easing === 'function' ? 'linear' : easing,
        })),
        {
          duration,
          fill: 'forwards',
        },
      );
      // add animation to current animation set
      currentAnimSet.current.push(anim);

      // commit styles and cancel animation when finished
      anim.finished
        .then(() => {
          anim.commitStyles();
          anim.cancel();
        })
        .catch(() => {});
    }
  });
};

const mDiv = <TVariants extends string>(
  {
    animate,
    initial,
    variants,
    ...rest
  }: {
    initial?: AnimateProperties | NoInfer<TVariants>;
    animate: AnimateOptions | NoInfer<TVariants>;
    variants?: Variants<TVariants>;
  } & ComponentProps<'div'>,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  const memodMatchedInitial = useMemo(
    () =>
      initial
        ? animatePropertiesToStyle(matchAgainstVariants(variants, initial))
        : {},
    [],
  );
  const elem = useRef<HTMLDivElement>(null!);

  useAnimation(elem, animate, variants);

  ref;
  return (
    <div
      ref={(e) => {
        if (!e) return;
        elem.current = e;
        if (typeof ref === 'function') {
          ref(e);
        } else if (ref) {
          ref.current = e;
        }
      }}
      {...rest}
      style={{
        ...rest.style,
        ...memodMatchedInitial,
      }}
    />
  );
};

export const m = {
  div: forwardRef(mDiv) as typeof mDiv,
};
