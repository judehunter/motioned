import React, { ComponentProps, useEffect, useRef, useState } from 'react';

const animatableProperties = ['opacity', 'x', 'y'];
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
    useAnimateOptionsEffect(animate, () => {
      // console.log({ ...prev }, { ...animate });
      animate.transform = `translate(${animate.x ?? 0}px, ${animate.y ?? 0}px)`;
      const transform = window
        .getComputedStyle(elem.current)
        .getPropertyValue('transform');
      const matrix = new WebKitCSSMatrix(transform);
      const prev = { transform: `translate(${matrix.m41}px, ${0}px)` };

      if (prev) {
        const anim = elem.current.animate([prev, animate], {
          duration: 1000,
          fill: 'forwards',
        });

        anim.finished.then(() => {
          anim.commitStyles();
          anim.cancel();
        });
      }
    });
    return <div ref={elem} {...rest} />;
  },
};
