import React, {
  ComponentProps,
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
} from 'react';

type ValueOrKeyframes<T> = T | T[] | [null, ...T[]];

type AnimateProperties = Partial<{
  opacity: ValueOrKeyframes<number>;
  // x: ValueOrKeyframes<number | string>;
  // y: ValueOrKeyframes<number | string>;
  rotate: ValueOrKeyframes<number | string>;
  translate: ValueOrKeyframes<string>;
  scale: ValueOrKeyframes<number>;
}>;

type AnimatePropertyName = keyof AnimateProperties;
const possibleAnimatePropertyNames = [
  'opacity',
  // 'x',
  // 'y',
  'rotate',
  'translate',
  'scale',
] as const;

type Transition = Partial<{
  duration: number;
  delay: number;
  easing: 'linear' | 'ease' | 'ease-out' | 'ease-in' | 'ease-in-out' | EasingFn;
}>;

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

const addPostfixToNumber = (value: string | number, unit: 'px' | 'deg') => {
  if (typeof value === 'number') {
    return `${value}${unit}`;
  }
  return value;
};

const coerceToCssValue = (
  property: AnimatePropertyName,
  value: string | number,
): string => {
  if (typeof value === 'number') {
    const match = {
      opacity: () => `${value}`,
      translate: () => `${value}`,
      rotate: () => `${addPostfixToNumber(value, 'deg')}`,
      scale: () => `${value}`,
    };
    return match[property]();
  }
  return value;
};

const removeUndefineds = <T extends Record<string, any>>(obj: T) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined),
  ) as Partial<T>;
};

// const resolveShorthands = (properties: AnimateProperties) => {
//   const translate = (properties.x || properties.y) ? ;
//   return removeUndefineds({translate})
// }

// const transformAnimateProperties = (properties: AnimateProperties) => {
//   const transformed = {
//     opacity: properties.opacity ? `${properties.opacity}` : undefined,
//     translate: (properties.x || properties.y) ? `${addPostfixToNumber(properties.x, 'px')} ${addPostfixToNumber(
//       properties.y ?? 0,
//       'px',
//     )}` : undefined,
//     rotate: `${addPostfixToNumber(properties.rotate ?? 0, 'deg')}`,
//     scale: `${properties.scale ?? 1}`,
//   };

//   return removeUndefineds(transformed);
// }
// const coerceAnimatePropertyObjectToCssValue = (opts: AnimateProperties) => {
//   const style = {
//     opacity: `${opts.opacity ?? 1}`,
//     translate: `${coerceToCssValue(opts.x ?? 0, 'px')} ${coerceToCssValue(
//       opts.y ?? 0,
//       'px',
//     )}`,
//     rotate: `${coerceToCssValue(opts.rotate ?? 0, 'deg')}`,
//     scale: `${opts.scale ?? 1}`,
//   };

//   return style;
// };

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

const SAMPLE_RESOLUTION = 10;
const sampleEasingFn = (easingFn: EasingFn, duration: number) => {
  const totalPoints = SAMPLE_RESOLUTION * (duration / 1000);
  let points = [];
  for (let progress = 0; progress < 1; progress += 1 / totalPoints) {
    points.push(easingFn(progress));
  }
  points.push(easingFn(1));
  return points;
};

const interpolateFloat = (a: number, b: number, t: number) => a + (b - a) * t;

// interpolate between two css values, by parsing them.
// return coerced again.
const interpolate =
  (property: AnimatePropertyName) => (a: string, b: string, t: number) => {
    if (property === 'scale') {
      return coerceToCssValue(
        'scale',
        interpolateFloat(parseFloat(a), parseFloat(b), t),
      );
    } else throw new Error(`Cannot interpolate ${property}`);
  };

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
    const { transition, ...properties } = matchedAnimate;

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
      const coercedKeyframes = rawKeyframes.map((value) =>
        coerceToCssValue(name as AnimatePropertyName, value!),
      );

      let keyframes = [];

      // if the catch-all easing or the specific easing is a function,
      // sample the easing function and use the sampled values as keyframes
      // for each pair of keyframes
      const easing =
        transition?.easing ?? transition?.[name as AnimatePropertyName]?.easing;
      const duration =
        transition?.duration ??
        transition?.[name as AnimatePropertyName]?.duration ??
        DEFAULT_DURATION;

      if (typeof easing === 'function') {
        const interpolator = interpolate(name as AnimatePropertyName);
        keyframes = coercedKeyframes.reduce((acc: string[], keyframe, i) => {
          if (i === 0) {
            return [];
          }
          const prevKeyframe = coercedKeyframes[i - 1];
          const prevNextSample = sampleEasingFn(easing, duration).map((y) =>
            interpolator(prevKeyframe, keyframe, y),
          );
          return [...acc, ...prevNextSample];
        }, []);
      } else {
        keyframes = rawKeyframes;
      }

      console.log(keyframes);

      // create and start animation
      const anim = elem.current.animate(
        keyframes.map((keyframe) => ({
          [name]: keyframe,
          easing: 'linear',
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

export const m = {
  div: <TVariants extends string>({
    animate,
    initial,
    variants,
    ...rest
  }: {
    initial?: AnimateProperties | NoInfer<TVariants>;
    animate: AnimateOptions | NoInfer<TVariants>;
    variants?: Variants<TVariants>;
  } & ComponentProps<'div'>) => {
    const memodMatchedInitial = useMemo(
      () =>
        initial
          ? animatePropertiesToStyle(matchAgainstVariants(variants, initial))
          : {},
      [],
    );
    const elem = useRef<HTMLDivElement>(null!);

    useAnimation(elem, animate, variants);

    return (
      <div
        ref={elem}
        {...rest}
        style={{
          ...rest.style,
          ...memodMatchedInitial,
        }}
      />
    );
  },
};
