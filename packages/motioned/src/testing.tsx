import React, { ComponentProps, useEffect, useMemo, useRef } from 'react';

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
  easing: string;
}>;

export type AnimateOptions = AnimateProperties & {
  transition?: Transition & Partial<Record<AnimatePropertyName, Transition>>;
};

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

  useEffect(() => cb(prev.current), [ref.current]);
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

const againstVariants = <T extends string | AnimateOptions>(
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
    const memodInitial = useMemo(() => initial, []);
    const elem = useRef<HTMLDivElement>(null!);
    const currentAnimSet = useRef<Animation[] | undefined>(undefined);

    const matchedAnimate = againstVariants(variants, animate);
    // console.log(animate);
    useAnimateOptionsEffect(matchedAnimate, () => {
      // const next = animateOptionsToStyle(animate);

      // const computedStyles = window.getComputedStyle(elem.current);

      // const translate = computedStyles.getPropertyValue('translate');
      // const rotate = computedStyles.getPropertyValue('rotate');

      // const prev = { translate, rotate };

      for (const currentAnim of currentAnimSet.current ?? []) {
        currentAnim.commitStyles();
        currentAnim.cancel();
      }
      currentAnimSet.current = [];

      const { transition, ...properties } = matchedAnimate;

      const computedStyles = window.getComputedStyle(elem.current);
      const getCurrentValue = (property: string) => {
        return computedStyles.getPropertyValue(property);
      };
      for (const [name, valueOrKeyframes] of Object.entries(properties)) {
        const keyframes = Array.isArray(valueOrKeyframes)
          ? valueOrKeyframes[0] === null
            ? [getCurrentValue(name), ...valueOrKeyframes.slice(1)]
            : valueOrKeyframes
          : [getCurrentValue(name), valueOrKeyframes];

        const coercedKeyframes = keyframes.map((value) =>
          coerceToCssValue(name as AnimatePropertyName, value!),
        );
        // console.log(coercedKeyframes);
        const anim = elem.current.animate(
          coercedKeyframes.map((keyframe) => ({
            [name]: keyframe,
            easing: 'ease-out',
          })),
          {
            duration: 700,
            fill: 'forwards',
          },
        );
        currentAnimSet.current.push(anim);
        anim.finished.then(() => {
          anim.commitStyles();
          anim.cancel();
        });
      }
    });

    return (
      <div
        ref={elem}
        {...rest}
        style={{
          ...rest.style,
          ...(memodInitial
            ? animatePropertiesToStyle(againstVariants(variants, memodInitial))
            : {}),
        }}
      />
    );
  },
};
