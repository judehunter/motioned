import {
  extractNumberFromCssValue,
  kebabize,
  matchAgainstVariants,
  matchAnimatePropertyNameToCssVariableName,
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
  type BasicEasingFns,
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
        return computedStyles.getPropertyValue(kebabize(property));
      };

      // split transition and properties
      const { transition: transitionObj, ...properties } = matchedAnimate;

      // loop over properties and create animations,
      // one for each property
      for (const [_name, valueOrKeyframes] of Object.entries(properties)) {
        const name = matchAnimatePropertyNameToCssVariableName(
          _name as AnimatePropertyName,
        );

        let lastVelocity = 0;
        // let currentDomValue: undefined | string = undefined;

        const currentAnim = currentAnims.current[name];

        if (currentAnim) {
          currentAnim.anim.commitStyles();

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
          coerceToCssValue(_name as AnimatePropertyName, value!),
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
              restDistance: transition.restDistance,
              restVelocity: transition.restVelocity,
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

        let isEasingFnList = false;

        if (Array.isArray(easing)) {
          const isCubic = typeof easing[0] === 'number';

          if (isCubic) {
            easing = `cubic-bezier(${easing.join(',')})`;
          } else {
            isEasingFnList = true;
          }
        }

        const easingFn = easing as Exclude<
          typeof easing,
          Function | Array<unknown>
        >;

        const isolateEasingFn = (list: Array<BasicEasingFns>, idx: number) => {
          const easingFn = list[idx + 1] ?? list[list.length - 1];

          if (typeof easingFn[0] === 'number') {
            return `cubic-bezier(${(easingFn as Array<number>).join(',')})`;
          }

          return easingFn as Exclude<BasicEasingFns, Array<unknown>>;
        };

        // create and start animation
        const anim = elem.current.animate(
          keyframes.map((keyframe, i) => ({
            [name]: keyframe,
            easing: isEasingFnList
              ? isolateEasingFn(easing as any, i)
              : undefined,
            offset:
              transition?.easing === 'spring'
                ? undefined
                : transition?.times?.[i],
          })),
          {
            duration,
            fill: 'forwards',
            delay: transition?.delay,
            easing: !isEasingFnList ? easingFn : undefined,
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
        ? animatePropertiesToStyle(
            matchAgainstVariants(
              variants,
              initial as AnimateOptions | string,
            ) as AnimateProperties,
          )
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
          'translateX(var(--x, 0px)) translateY(var(--y, 0px)) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg)) rotateZ(var(--rotate-z, 0deg)) scaleX(var(--scale-x, 1)) scaleY(var(--scale-y, 1)) skewX(var(--skew-x, 0)) skewY(var(--skew-y, 0))',
      }}
    />
  );
};

export const m = {
  div: forwardRef(mDiv) as typeof mDiv,
};
