import { Meta, StoryObj } from '@storybook/react';
import throttle from 'lodash.throttle';
import { RefObject, useEffect, useRef, useState } from 'react';

function useFollowPointer(
  ref: RefObject<HTMLElement>,
  cb: (point: { x: number; y: number }) => void,
) {
  const [point, setPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const handlePointerMove = throttle(({ clientX, clientY }: MouseEvent) => {
      const element = ref.current!;

      const x = clientX - element.offsetLeft - element.offsetWidth / 2;
      const y = clientY - element.offsetTop - element.offsetHeight / 2;
      setPoint({ x, y });
      cb({ x, y });
    }, 0);

    window.addEventListener('pointermove', handlePointerMove);

    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  return point;
}

const makeExactSpring = (
  { from, to, velocity }: { from: number; to: number; velocity: number },
  {
    stiffness,
    friction,
    mass,
    restDistance = 0.5,
    restVelocity = 0.1,
  }: {
    stiffness: number;
    friction: number;
    mass: number;
    restDistance?: number;
    restVelocity?: number;
  },
) => {
  const initialDelta = to - from;
  const undampedAngularFreq = Math.sqrt(stiffness / mass) / 1000;
  const dampingRatio = friction / (2 * Math.sqrt(stiffness * mass));

  let resolveSpring: (t: number) => number;

  if (dampingRatio < 1) {
    const angularFreq =
      undampedAngularFreq * Math.sqrt(1 - dampingRatio * dampingRatio);

    // Underdamped spring (bouncy)
    resolveSpring = (t) =>
      to -
      Math.exp(-dampingRatio * undampedAngularFreq * t) *
        (((-velocity + dampingRatio * undampedAngularFreq * initialDelta) /
          angularFreq) *
          Math.sin(angularFreq * t) +
          initialDelta * Math.cos(angularFreq * t));
  } else {
    // Critically damped spring
    resolveSpring = (t) => {
      return (
        to -
        Math.exp(-undampedAngularFreq * t) *
          (initialDelta + (-velocity + undampedAngularFreq * initialDelta) * t)
      );
    };
  }

  return (t: number) => {
    const position = resolveSpring(t);
    const prevT = Math.max(t - 5, 0);
    const velocity = velocityPerSecond(
      position - resolveSpring(prevT),
      t - prevT,
    );
    // console.log(velocity);

    const atRest =
      Math.abs(to - position) < restDistance &&
      Math.abs(velocity) < restVelocity;

    return {
      position,
      velocity,
      atRest,
    };
  };
};

function velocityPerSecond(velocity: number, frameDuration: number) {
  return frameDuration ? velocity * (1 / frameDuration) : 0;
}

const sampleExactSpring = (
  generator: ReturnType<typeof makeExactSpring>,
  from: number,
  to: number,
  resolution = 60,
) => {
  const MAX_TIME = 10 * 1_000;
  const inverseResolution = 1_000 / resolution;
  let positions = [];
  let time = 0;
  for (; time < MAX_TIME; time += inverseResolution) {
    const { position, atRest } = generator(time);

    positions.push(position);
    if (atRest) {
      break;
    }
  }
  positions.push(to);

  const mappedPositions = positions.map((p) =>
    to === from ? 1 : (p - from) / (to - from),
  );

  return {
    mappedPositions,
    duration: time,
  };
};

const useAnimateExact = (
  ref: { current: HTMLElement },
  property: string,
  to: string,
) => {
  const last = useRef<{
    anim: Animation;
    generator: ReturnType<typeof makeExactSpring>;
    duration: number;
  } | null>(null);
  const raf = useRef<number | undefined>();
  useEffect(() => {
    if (raf.current) {
      return;
    }
    raf.current = requestAnimationFrame(() => {
      // const progress =
      //   last.current?.anim.effect?.getComputedTiming().progress ?? 1;
      // const elapsedTime = last.current?.anim.effect
      //   ? (last.current!.anim.effect!.getComputedTiming().duration as number) *
      //     progress
      //   : undefined;
      // const lastVelocity = elapsedTime
      //   ? last.current?.generator(elapsedTime).velocity ?? 0
      //   : 0;

      // console.log(lastVelocity);

      let lastVelocity = 0;

      if (last.current) {
        last.current?.anim.commitStyles();

        if (last.current.anim.effect) {
          const progress =
            last.current.anim.effect.getComputedTiming().progress ?? 1;

          const elapsedTime =
            (last.current.anim.effect.getComputedTiming().duration as number) *
            progress;

          const { velocity, atRest } = last.current.generator(elapsedTime);
          if (atRest) {
            lastVelocity = 0;
          } else {
            lastVelocity = velocity;
          }
        }
      }

      const from = getComputedStyle(ref.current).getPropertyValue(property);

      const generator = makeExactSpring(
        {
          from: +from.slice(0, -2),
          to: +to.slice(0, -2),
          velocity: lastVelocity,
        },
        { stiffness: 100, friction: 10, mass: 1 },
      );
      const spring = sampleExactSpring(
        generator,
        +from.slice(0, -2),
        +to.slice(0, -2),
      );

      // console.log(spring);

      const anim = ref.current.animate(
        [
          {
            [property]: from,
            easing: `linear(${spring.mappedPositions.join(',')})`,
          },
          {
            [property]: to,
            easing: `linear(${spring.mappedPositions.join(',')})`,
          },
        ],
        { fill: 'forwards', duration: spring.duration },
      );

      last.current = { anim, generator, duration: spring.duration };

      raf.current = undefined;
    });
  }, [to]);
};

(CSS as any).registerProperty({
  name: '--x',
  syntax: '<length-percentage>',
  inherits: false,
  initialValue: '0px',
});

(CSS as any).registerProperty({
  name: '--y',
  syntax: '<length-percentage>',
  inherits: false,
  initialValue: '0px',
});

const Component = () => {
  const ref = useRef<HTMLDivElement>(null!);
  const { x, y } = useFollowPointer(ref, () => {});
  // const [x, setX] = useState(400);
  useAnimateExact(ref, '--x', `${x}px`);
  useAnimateExact(ref, '--y', `${y}px`);
  // useEffect(() => {
  //   setTimeout(() => {
  //     console.log('swap');
  //     setX(300);
  //   }, 2000);
  // }, []);

  return (
    <div
      className="rounded-full w-16 h-16 bg-blue-500"
      style={{ transform: 'translateX(var(--x)) translateY(var(--y))' }}
      ref={ref}
    />
  );
};

const meta = {
  title: 'Example/Velocity Waapi Motion One',
  component: Component,
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
