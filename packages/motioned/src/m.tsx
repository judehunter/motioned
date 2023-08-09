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

        // create and start animation
        const anim = elem.current.animate(
          keyframes.map((keyframe) => ({
            [name]: keyframe,
            easing: easing as Exclude<typeof easing, Function>,
          })),
          {
            duration,
            fill: 'forwards',
            delay: transition?.delay,
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

// forwardRef is naughty.
const typedForwardRef = <T,>(render: T) => forwardRef(render as any) as T;

// maps 'div' to 'HTMLDivElement', 'circle' to 'SVGCircleElement', etc.
// this is needed for the `ref` prop in `makeMElem`
type ElementTypeOf<T extends keyof React.JSX.IntrinsicElements> =
  React.JSX.IntrinsicElements[T] extends React.DetailedHTMLProps<
    React.HTMLAttributes<infer U>,
    any
  >
    ? U
    : never;

const makeMElem = <TElement extends keyof React.JSX.IntrinsicElements>(
  Element: TElement,
) =>
  typedForwardRef(
    <TVariants extends string>(
      {
        animate,
        initial,
        variants,
        ...rest
      }: {
        initial?: AnimateProperties | NoInfer<TVariants>;
        animate: AnimateOptions | NoInfer<TVariants>;
        variants?: Variants<TVariants>;
        ref?: React.Ref<ElementTypeOf<TElement>>;
      } & ComponentProps<TElement>,
      ref: ForwardedRef<TElement>,
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

      const ElementAsAny = Element as any;

      const { ref: _, ...restWithoutRef } = rest;

      return (
        <ElementAsAny
          ref={(e: any) => {
            if (!e) return;
            elem.current = e;
            if (typeof ref === 'function') {
              ref(e);
            } else if (ref) {
              ref.current = e;
            }
          }}
          {...restWithoutRef}
          style={{
            ...rest.style,
            ...memodMatchedInitial,
            transform:
              'translateX(var(--x, 0px)) translateY(var(--y, 0px)) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg)) rotateZ(var(--rotate-z, 0deg)) scaleX(var(--scale-x, 1)) scaleY(var(--scale-y, 1)) skewX(var(--skew-x, 0)) skewY(var(--skew-y, 0))',
          }}
        />
      );
    },
  );

// the actual component type
type MElem<TElement extends keyof React.JSX.IntrinsicElements> = ReturnType<
  typeof makeMElem<TElement>
>;

// all HTML elements mapped
// TODO: should probably exclude stuff like "title"
export const m = Object.fromEntries(
  [
    'a',
    'abbr',
    'address',
    'area',
    'article',
    'aside',
    'audio',
    'b',
    'base',
    'bdi',
    'bdo',
    'blockquote',
    'body',
    'br',
    'button',
    'canvas',
    'caption',
    'cite',
    'code',
    'col',
    'colgroup',
    'data',
    'datalist',
    'dd',
    'del',
    'details',
    'dfn',
    'dialog',
    'div',
    'dl',
    'dt',
    'em',
    'embed',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'head',
    'header',
    'hgroup',
    'hr',
    'html',
    'i',
    'iframe',
    'img',
    'input',
    'ins',
    'kbd',
    'label',
    'legend',
    'li',
    'link',
    'main',
    'map',
    'mark',
    'menu',
    'meta',
    'meter',
    'nav',
    'noscript',
    'object',
    'ol',
    'optgroup',
    'option',
    'output',
    'p',
    'path',
    'param',
    'picture',
    'pre',
    'progress',
    'q',
    'rp',
    'rt',
    'ruby',
    's',
    'samp',
    'script',
    'section',
    'select',
    'small',
    'source',
    'span',
    'strong',
    'style',
    'sub',
    'summary',
    'sup',
    'svg',
    'table',
    'tbody',
    'td',
    'template',
    'textarea',
    'tfoot',
    'th',
    'thead',
    'time',
    'title',
    'tr',
    'track',
    'u',
    'ul',
    'var',
    'video',
    'wbr',
  ].map((name) => [name, makeMElem(name as any)]),
) as any as {
  // mapping all html elements to their m counterparts
  [K in keyof React.JSX.IntrinsicElements]: MElem<K>;
};
