import { Meta, StoryObj } from '@storybook/react';
import { useEffect, useRef, useState } from 'react';

import { useAnimate as useReactSpringAnimation } from './ReactSpringExperiments.stories';

const sampleSpring = (
  {
    from,
    to,
    velocity,
    resolution = 60,
  }: { from: number; to: number; velocity: number; resolution?: number },
  {
    stiffness,
    friction,
    mass,
  }: {
    stiffness: number;
    friction: number;
    mass: number;
  },
) => {
  let position = from;

  const INVERSE_SAMPLE_RESOLUTION = 1 / resolution;
  const INVERSE_SAMPLE_RESOLUTION_MS = INVERSE_SAMPLE_RESOLUTION * 1000;
  const MAX_TIME = 10 * 1000;

  let positions = [from];
  let velocities = [];
  let time = 0;
  for (; time < MAX_TIME; time += INVERSE_SAMPLE_RESOLUTION_MS) {
    const displacement = position - to;
    const springForce = -stiffness * 0.000001 * displacement;
    const frictionForce = -friction * 0.001 * velocity;
    const acceleration = (springForce + frictionForce) / mass;

    velocity += acceleration * INVERSE_SAMPLE_RESOLUTION_MS;
    const deltaPosition = velocity * INVERSE_SAMPLE_RESOLUTION_MS;
    position += deltaPosition;

    positions.push(position);
    velocities.push(velocity);

    const DELTA = 0.01;
    if (Math.abs(displacement) < DELTA && Math.abs(velocity) < DELTA) {
      break;
    }
  }
  positions.push(to);

  const mappedPositions = positions.map((p) =>
    to === from ? 1 : (p - from) / (to - from),
  );

  return { duration: time, positions, velocities, mappedPositions };
};

const lerpVelocity = (floatIndex: number, velocities: number[]) => {
  const minV = velocities[Math.floor(floatIndex)] ?? 0;
  const maxV = velocities[Math.ceil(floatIndex)] ?? 0;

  const fraction = floatIndex - Math.floor(floatIndex);

  return -fraction * minV + fraction * maxV + minV;
};

const useAnimate = (
  ref: { current: HTMLElement },
  property: string,
  to: string,
  resolution: number = 60,
) => {
  const last = useRef<{ anim: Animation; velocities: number[] } | null>(null);
  const raf = useRef<number | undefined>();
  useEffect(() => {
    if (raf.current) {
      return;
    }
    raf.current = requestAnimationFrame(() => {
      last.current?.anim.commitStyles();
      const progress =
        last.current?.anim.effect?.getComputedTiming().progress ?? 1;
      const lastVelocity = last.current?.velocities.length
        ? lerpVelocity(
            (last.current?.velocities.length - 1) * progress,
            last.current?.velocities,
          )
        : 0;

      const from = getComputedStyle(ref.current).getPropertyValue(property);

      const spring = sampleSpring(
        {
          from: +from.slice(0, -2),
          to: +to.slice(0, -2),
          velocity: lastVelocity,
          resolution,
        },
        { stiffness: 100, friction: 5, mass: 1 },
      );

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

      last.current = { anim, velocities: spring.velocities };

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
        { stiffness: 100, friction: 5, mass: 1 },
      );
      const spring = sampleExactSpring(
        makeExactSpring(
          {
            from: +from.slice(0, -2),
            to: +to.slice(0, -2),
            velocity: lastVelocity,
          },
          { stiffness: 100, friction: 5, mass: 1 },
        ),
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

const Component = () => {
  const ref = useRef<HTMLDivElement>(null!);
  const ref600 = useRef<HTMLDivElement>(null!);
  const refReactSpring = useRef<HTMLDivElement>(null!);
  const refExact = useRef<HTMLDivElement>(null!);

  const [x, setX] = useState(0);

  useAnimate(ref, '--x', `${x}px`);
  useAnimate(ref600, '--x', `${x}px`, 600);

  useReactSpringAnimation(refReactSpring, '--x', x, (curX) =>
    refReactSpring.current.style.setProperty('--x', `${curX}px`),
  );

  useAnimateExact(refExact, '--x', `${x}px`);

  return (
    <div>
      <div
        className="w-[40px] h-[40px] rounded-full bg-green-500"
        style={{ transform: 'translateX(var(--x)) translateY(var(--y))' }}
        ref={ref}
      />
      <div
        className="w-[40px] h-[40px] rounded-full bg-red-500 mt-4"
        style={{ transform: 'translateX(var(--x)) translateY(var(--y))' }}
        ref={ref600}
      />

      <div
        className="w-[40px] h-[40px] rounded-full bg-blue-500 border mt-4"
        style={{ transform: 'translateX(var(--x)) translateY(var(--y))' }}
        ref={refExact}
      />

      <div
        className="w-[40px] h-[40px] rounded-full border mt-4"
        style={{ transform: 'translateX(var(--x)) translateY(var(--y))' }}
        ref={refReactSpring}
      />

      <button
        onClick={() => {
          setX((prevState) => (prevState === 100 ? 0 : 100));
        }}
        className="my-6"
      >
        Toggle animation
      </button>

      <div>
        <div className="text-green-500">60</div>
        <div className="text-red-500">600</div>
        <div>React Spring</div>
      </div>
    </div>
  );
};

const meta = {
  title: 'Example/Velocity Waapi Resolution',
  component: Component,
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
