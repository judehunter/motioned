import React, { ComponentProps, useEffect, useRef } from 'react';

const animatableProperties = ['opacity', 'x', 'y', 'rotate', 'scale'] as const;

type AnimatableProperty = 'opacity' | 'x' | 'y' | 'rotate' | 'scale';

type AnimatablePropertyObject = Partial<{
  opacity: number;
  x: number | string;
  y: number | string;
  rotate: number | string;
  scale: number;
}>;

type Transition = Partial<{
  duration: number;
  delay: number;
  easing: string;
}>;

export type AnimateOptions = AnimatablePropertyObject & {
  transition?: Transition & Partial<Record<AnimatableProperty, Transition>>;
};

const animateOptionsEqual = (
  a: AnimateOptions,
  b: AnimateOptions | undefined,
) => {
  if (b === undefined) {
    return false;
  }
  for (const prop of animatableProperties) {
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

  // console.log(ref.current, opts);
  if (!animateOptionsEqual(opts, ref.current)) {
    // console.log('different');
    prev.current = ref.current;
    ref.current = opts;
  }

  useEffect(() => cb(prev.current), [ref.current]);
}

const coerceToCssValue = (value: string | number, unit: 'px' | 'deg') => {
  if (typeof value === 'number') {
    return `${value}${unit}`;
  }
  return value;
};

const animateOptionsToStyle = (opts: AnimateOptions) => {
  const style = {
    opacity: `${opts.opacity ?? 1}`,
    translate: `${coerceToCssValue(opts.x ?? 0, 'px')} ${coerceToCssValue(
      opts.y ?? 0,
      'px',
    )}`,
    rotate: `${coerceToCssValue(opts.rotate ?? 0, 'deg')}`,
    scale: `${opts.scale ?? 1}`,
  };

  return style;
};

type NoInfer<T> = [T][T extends any ? 0 : never];

type Variants<TVariants extends string = string> = Record<
  TVariants,
  AnimateOptions
>;

const againstVariants = <T extends string | AnimateOptions | undefined,>(
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
    return key;
  }
};

export const m = {
  div: <TVariants extends string>({
    animate,
    initial,
    variants,
    ...rest
  }: {
    initial?: AnimatablePropertyObject | NoInfer<TVariants>;
    animate: AnimateOptions | NoInfer<TVariants>;
    variants?: Variants<TVariants>;
  } & ComponentProps<'div'>) => {
    const elem = useRef<HTMLDivElement>(null!);
    const currentAnim = useRef<Animation | undefined>(undefined);

    useAnimateOptionsEffect(animate, () => {
      animate = againstVariants(variants, animate);

      const next = animateOptionsToStyle(animate);

      const computedStyles = window.getComputedStyle(elem.current);

      const translate = computedStyles.getPropertyValue('translate');
      const rotate = computedStyles.getPropertyValue('rotate');

      const prev = { translate, rotate };

      currentAnim.current?.cancel();

      const anim = elem.current.animate([prev, next], {
        duration: 300,
        fill: 'forwards',
        easing: 'ease-in-out',
      });

      currentAnim.current = anim;

      anim.finished.then(() => {
        anim.commitStyles();
        anim.cancel();
      });
    });

    return (
      <div
        ref={elem}
        {...rest}
        style={{
          ...rest.style,
          ...(initial
            ? animateOptionsToStyle(againstVariants(variants, initial))
            : {}),
        }}
      />
    );
  },
};
