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

const Component = () => {
  const ref = useRef<HTMLDivElement>(null!);
  const ref600 = useRef<HTMLDivElement>(null!);
  const refReactSpring = useRef<HTMLDivElement>(null!);

  const [x, setX] = useState(0);

  useAnimate(ref, '--x', `${x}px`);
  useAnimate(ref600, '--x', `${x}px`, 600);

  useReactSpringAnimation(refReactSpring, '--x', x, (curX) =>
    refReactSpring.current.style.setProperty('--x', `${curX}px`),
  );

  return (
    <div>
      <div
        className="w-[40px] h-[40px] rounded-full bg-green-500"
        style={{ transform: 'translateX(var(--x)) translateY(var(--y))' }}
        ref={ref}
      />
      <div
        className="w-[40px] h-[40px] rounded-full bg-red-500 my-4"
        style={{ transform: 'translateX(var(--x)) translateY(var(--y))' }}
        ref={ref600}
      />

      <div
        className="w-[40px] h-[40px] rounded-full border"
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
