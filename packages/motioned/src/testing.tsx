import React, { ComponentProps, useEffect, useRef } from 'react';

const animatableProperties = ['opacity', 'x', 'y'] as const;
type AnimatableProperty = (typeof animatableProperties)[number];

type Transition = Partial<{
  duration: number;
  delay: number;
  easing: string;
}>;

type AnimateOptions = Partial<Record<AnimatableProperty, string | number>> & {
  transition?: Transition & Partial<Record<AnimatableProperty, Transition>>;
};

// const valueToKeyframes = () => {};

// const animate = (elem: HTMLElement, opts: AnimateOptions) => {
//   elem.animate();
// };

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

const coerceToCssValue = (value: string | number) => {
  if (typeof value === 'number') {
    return `${value}px`;
  }
  return value;
};

export const m = {
  div: ({
    animate,
    initial,
    ...rest
  }: {
    initial: Partial<Record<AnimatableProperty, string | number>>;
    animate: AnimateOptions;
  } & ComponentProps<'div'>) => {
    const elem = useRef<HTMLDivElement>(null!);
    const currentAnim = useRef<Animation | undefined>(undefined);

    useAnimateOptionsEffect(animate, () => {
      const next = {
        translate: `${coerceToCssValue(animate.x ?? 0)} ${coerceToCssValue(
          animate.y ?? 0,
        )}`,
      };

      const translate = window
        .getComputedStyle(elem.current)
        .getPropertyValue('translate');

      const prev = { translate };

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

    return <div ref={elem} {...rest} />;
  },
};
