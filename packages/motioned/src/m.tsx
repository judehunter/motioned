import {
  extractNumberFromCssValue,
  kebabize,
  matchAgainstVariants,
  matchAnimatePropertyNameToCssVariableName,
  mapEasingOrEasingList,
  stripTransition,
  TweenTransition,
  SpringTransition,
  reduceTransitionInheritance,
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
  transition: AnimateOptions['transition'] | undefined,
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
      const { transition: animateTransition, ...properties } = matchedAnimate;

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

        const resolvedTransition = reduceTransitionInheritance([
          transition,
          transition?.[_name as AnimatePropertyName],
          animateTransition,
          animateTransition?.[_name as AnimatePropertyName],
        ]);

        let easing = asSelf(
          resolvedTransition?.easing ?? 'ease-in-out',
          (self) => self as typeof self | (string & {}),
        );

        let duration: number;
        let generator: undefined | Generator;

        if (resolvedTransition?.easing === 'spring') {
          // NOTE: for springs, only two keyframes are currently supported
          const stiffness = resolvedTransition?.stiffness ?? 100;
          const friction = resolvedTransition?.friction ?? 10;
          const mass = resolvedTransition?.mass ?? 1;

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
              restDistance: resolvedTransition.restDistance,
              restVelocity: resolvedTransition.restVelocity,
            },
          );
          const s = sampleGenerator(generator, from, to);
          easing = `linear(${s.easingPositions.join(',')})`;
          duration = s.duration;
        } else {
          duration = resolvedTransition?.duration ?? DEFAULT_DURATION;
        }

        const [easingOrEasingList, times]: any = mapEasingOrEasingList(
          easing as any,
          duration,
          resolvedTransition?.easing === 'spring'
            ? undefined
            : resolvedTransition?.times,
        );

        // create and start animation
        const anim = elem.current.animate(
          keyframes.map((keyframe, i) => ({
            [name]: keyframe,
            easing: Array.isArray(easingOrEasingList)
              ? easingOrEasingList[i]
              : easingOrEasingList,
            offset: times?.[i],
          })),
          {
            duration,
            fill: 'forwards',
            delay: resolvedTransition?.delay,
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
        transition,
        ...rest
      }: {
        initial?: AnimateProperties | NoInfer<TVariants> | false;
        animate: AnimateOptions | NoInfer<TVariants>;
        transition?: AnimateOptions['transition'];
        variants?: Variants<TVariants>;
        ref?: React.Ref<ElementTypeOf<TElement>>;
      } & ComponentProps<TElement>,
      ref: ForwardedRef<TElement>,
    ) => {
      const initialOrAnimate = stripTransition(
        initial === false ? animate : initial,
      );
      const memodMatchedInitial = useMemo(
        () =>
          initialOrAnimate
            ? animatePropertiesToStyle(
                matchAgainstVariants(
                  variants,
                  initialOrAnimate as AnimateOptions | string,
                ) as AnimateProperties,
              )
            : {},
        [],
      );

      const elem = useRef<HTMLDivElement>(null!);

      useAnimation(elem, animate, variants, transition);

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
            transform: `translateX(var(--x, 0px)) translateY(var(--y, 0px)) translateZ(var(--z, 0px)) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg)) rotateZ(var(--rotate-z, 0deg)) scaleX(var(--scale-x, 1)) scaleY(var(--scale-y, 1)) skewX(var(--skew-x, 0)) skewY(var(--skew-y, 0)) matrix(var(--matrix, 1, 0, 0, 1, 0, 0)) ${
              rest.style?.transform ?? ''
            }`,
          }}
        />
      );
    },
  );

// const makeMotioned =
//   (htmlElement: keyof React.JSX.IntrinsicElements) =>
//   <TProps extends Record<string, any>>(
//     Component: (props: TProps) => React.JSX.Element,
//   ) => ({props}: {props: NoInfer<TProps>}) => {
//     const element = <Component {...props} />
//     element.
//   };
// const ABC = ({ style }: { style: any }) => <div />;
// const test = () => <ABC style={{ color: 'blue' }} />;
// console.log();
// makeMotioned('div');

// the actual component type
type MElem<TElement extends keyof React.JSX.IntrinsicElements> = ReturnType<
  typeof makeMElem<TElement>
>;

const htmlElements = [
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
] as const;

// all HTML elements mapped
// TODO: should probably exclude stuff like "title"
export const m = Object.fromEntries(
  htmlElements.map((name) => [name, makeMElem(name as any)]),
) as any as {
  // mapping all html elements to their m counterparts
  [K in keyof React.JSX.IntrinsicElements]: MElem<K>;
};
