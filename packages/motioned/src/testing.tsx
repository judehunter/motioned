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
  x: ValueOrKeyframes<number | string>;
  y: ValueOrKeyframes<number | string>;
  rotate: ValueOrKeyframes<number | string>;
  translate: ValueOrKeyframes<string>;
  transform: ValueOrKeyframes<string>;
  scale: ValueOrKeyframes<number>;
  width: ValueOrKeyframes<number | string>;
}>;

type AnimatePropertyName = keyof AnimateProperties;
const possibleAnimatePropertyNames = [
  'opacity',
  'x',
  'y',
  'rotate',
  'translate',
  'transform',
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
    return match(property)
      .with('rotate', () => `${value}deg`)
      .with('width', () => `${value}px`)
      .otherwise(() => `${value}`);
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

/**
 * returns a sample for a spring
 * @param stiffness k in Hooke's law
 * @param friction damping
 */
const sampleSpring = (
  {
    stiffness,
    friction,
    mass,
  }: {
    stiffness: number;
    friction: number;
    mass: number;
  },
  startVelocity: number,
) => {
  // x is normalized to be |a - b| = 1,
  // since the spring is an easing function,
  // and so it returns values 0 through 1.
  let x = 1;
  let velocity = startVelocity;

  // how often to sample, in seconds
  const INVERSE_SAMPLE_RESOLUTION = 1 / SAMPLE_RESOLUTION;
  const MAX_TIME = 10;

  let points = [];
  let velocities = [velocity];
  let lastDisplacement = 0;
  let time = 0;
  for (; time < MAX_TIME; time += INVERSE_SAMPLE_RESOLUTION) {
    const acceleration = (-stiffness * x - friction * velocity) / mass;
    velocity += acceleration * INVERSE_SAMPLE_RESOLUTION;
    velocities.push(velocity);
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

  return { duration: time * 1000, points, velocities };
};

const asSelf = <TOriginal, TCast>(
  original: TOriginal,
  cast: (original: TOriginal) => TCast,
) => original as any as TCast;

// (CSS as any).registerProperty({
//   name: '--x',
//   syntax: '<length-percentage>',
//   inherits: false,
//   initialValue: '0px',
// });

// (CSS as any).registerProperty({
//   name: '--y',
//   syntax: '<length-percentage>',
//   inherits: false,
//   initialValue: '0px',
// });

const DEFAULT_DURATION = 500;
const useAnimation = (
  elem: MutableRefObject<HTMLElement>,
  animate: AnimateOptions,
  variants: Variants | undefined,
) => {
  const currentAnims = useRef<
    Record<
      string,
      | {
          anim: Animation;
          spring:
            | undefined
            | { duration: number; points: number[]; velocities: number[] };
        }
      | undefined
    >
  >({});
  const matchedAnimate = matchAgainstVariants(variants, animate);

  useAnimateOptionsEffect(matchedAnimate, async () => {
    const springVelocities: Record<string, number | undefined> = {};
    // cancel previous animation set and commit styles
    for (const [name, definition] of Object.entries(currentAnims.current)) {
      if (definition) {
        if (definition.spring) {
          const progress =
            definition.anim.effect?.getComputedTiming().progress ?? 1;

          const lastIndex = Math.ceil(
            (definition.spring.velocities.length - 1) * progress,
          );

          springVelocities[name] = definition.spring.velocities[lastIndex];
        }

        definition.anim.commitStyles();
        definition.anim.cancel();
      }
    }

    // clear previous animation set
    currentAnims.current = {};

    // get current computed styles
    const computedStyles = window.getComputedStyle(elem.current);

    /**
     * Get the current value of a property from the computed styles
     */
    const getCurrentValue = (property: string) => {
      return computedStyles.getPropertyValue(property);
    };

    // split transition and properties
    const { transition: transitionObj, ...properties } = matchedAnimate;

    // loop over properties and create animations,
    // one for each property
    for (const [_name, valueOrKeyframes] of Object.entries(properties)) {
      const name = match(_name)
        .with('x', () => '--x')
        .with('y', () => '--y')
        .otherwise(() => _name);
      // if the property is defined as keyframes, use them,
      // otherwise use the current value as the first keyframe.
      // if the first keyframe is null, use the current value as the first keyframe.
      const rawKeyframes = (
        Array.isArray(valueOrKeyframes)
          ? valueOrKeyframes[0] === null
            ? [getCurrentValue(name), ...valueOrKeyframes.slice(1)]
            : valueOrKeyframes
          : [getCurrentValue(name), valueOrKeyframes]
      ) as (string | number)[];

      // map non-css convenience values to css values,
      // e.g. 0 -> '0px' for width
      const keyframes = rawKeyframes.map((value) =>
        coerceToCssValue(name as AnimatePropertyName, value!),
      );

      const transition =
        transitionObj?.[name as AnimatePropertyName] ?? transitionObj;

      let easing = asSelf(
        transition?.easing ?? 'ease-in-out',
        (self) => self as typeof self | (string & {}),
      );

      let duration: number;
      let spring:
        | undefined
        | {
            duration: number;
            points: number[];
            velocities: number[];
          };
      if (transition?.easing === 'spring') {
        const stiffness = transition?.stiffness ?? 100;
        const friction = transition?.friction ?? 10;
        const mass = transition?.mass ?? 1;

        // calculate the current velocity of the previous string animation.
        let startVelocity = -Math.abs(springVelocities[name] ?? 0);
        const s = sampleSpring(
          {
            stiffness,
            friction,
            mass,
          },
          startVelocity,
        );
        spring = s;
        easing = (t: number) => s.points[Math.floor((s.points.length - 1) * t)];
        duration = spring.duration;
      } else {
        duration = transition?.duration ?? DEFAULT_DURATION;
      }

      if (typeof easing === 'function') {
        easing = `linear(${sampleEasingFn(easing, duration).join(',')})`;
      }

      // create and start animation
      const anim = elem.current.animate(
        keyframes.map((keyframe) => ({
          [name]: keyframe,
          easing: easing as Exclude<typeof easing, Function>,
        })),
        {
          duration,
          fill: 'forwards',
        },
      );
      // add animation to current animation set
      currentAnims.current[name] = { anim, spring };

      // commit styles and cancel animation when finished
      (async () => {
        let err = false;
        try {
          await anim.finished;
        } catch (e) {
          err = true;
        }
        if (!err) {
          anim.commitStyles();
          anim.cancel();
        }
      })();
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
