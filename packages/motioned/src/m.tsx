import {
  extractNumberFromCssValue,
  matchAgainstVariants,
  matchAnimatePropertyNameToCssPropertyName,
  sampleEasingFn,
} from './utils.js';
import {
  AnimateOptions,
  AnimateProperties,
  AnimatePropertyName,
  NoInfer,
  Variants,
  animatePropertiesToStyle,
  coerceToCssValue,
  useAnimateOptionsEffect,
} from './utils.js';
import { asSelf } from './utils.js';
import React, {
  ComponentProps,
  ForwardedRef,
  MutableRefObject,
  forwardRef,
  useMemo,
  useRef,
} from 'react';
import { match } from 'ts-pattern';
import { registerCSSProperties } from './utils.js';
import { Generator, sampleGenerator } from './generators/generators.js';
import { makeSpringGenerator } from './generators/spring.js';

registerCSSProperties();

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
          generator: Generator | undefined;
        }
      | undefined
    >
  >({});
  const matchedAnimate = matchAgainstVariants(variants, animate);

  const animationFrame = useRef<number | undefined>();

  const animationFrameCallback = useRef<() => void>();

  useAnimateOptionsEffect(matchedAnimate, async () => {
    animationFrameCallback.current = () => {
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
        const name = matchAnimatePropertyNameToCssPropertyName(
          _name as AnimatePropertyName,
        );

        let lastVelocity = 0;
        // let currentDomValue: undefined | string = undefined;

        const currentAnim = currentAnims.current[name];

        if (currentAnim) {
          currentAnim.anim.commitStyles();

          // currentDomValue = getCurrentValue(_name);

          const effect = currentAnim.anim.effect;
          if (effect && currentAnim.generator) {
            const computedTiming = effect.getComputedTiming();
            const progress = computedTiming.progress ?? 1;

            const elapsedTime = (computedTiming.duration as number) * progress;

            const { velocity, atRest } = currentAnim.generator(elapsedTime);
            if (!atRest) {
              lastVelocity = velocity;
            }
          }

          currentAnim.anim.cancel();
        }

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
        let generator: undefined | Generator;
        if (transition?.easing === 'spring') {
          // NOTE: for springs, only two keyframes are currently supported
          const stiffness = transition?.stiffness ?? 100;
          const friction = transition?.friction ?? 10;
          const mass = transition?.mass ?? 1;

          const from = extractNumberFromCssValue(`${rawKeyframes[0]}`);
          const to = extractNumberFromCssValue(`${rawKeyframes[1]}`);

          generator = makeSpringGenerator(
            {
              from,
              to,
              velocity: lastVelocity,
            },
            {
              stiffness,
              friction,
              mass,
            },
          );
          const s = sampleGenerator(generator, from, to);
          easing = `linear(${s.easingPositions.join(',')})`;
          duration = s.duration;
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
        currentAnims.current[name] = { anim, generator };
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
    };

    if (!animationFrame.current) {
      animationFrame.current = requestAnimationFrame(() => {
        animationFrame.current = undefined;
        animationFrameCallback.current!();
      });
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
        transform:
          'translate(var(--x), var(--y)) rotate(var(--rotate-z)) scale(var(--scale-x), var(--scale-y))',
      }}
    />
  );
};

export const m = {
  div: forwardRef(mDiv) as typeof mDiv,
};
