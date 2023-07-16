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

const SAMPLE_RESOLUTION = 60;
const sampleSpring = (
  { from, to, velocity }: { from: number; to: number; velocity: number },
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

  const INVERSE_SAMPLE_RESOLUTION = 1 / SAMPLE_RESOLUTION;
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
  const lowestVelocity = velocities[Math.floor(floatIndex)] ?? 0;
  const highestVelocity = velocities[Math.ceil(floatIndex)] ?? 0;

  const fraction = floatIndex - Math.floor(floatIndex);

  return lowestVelocity + (highestVelocity - lowestVelocity) * fraction;
};

const useAnimate = (
  ref: { current: HTMLElement },
  property: string,
  to: string,
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
      const lastVelocity = lerpVelocity(
        ((last.current?.velocities.length ?? 0) - 1) * progress,
        last.current?.velocities ?? [],
      );

      // last.current?.anim.cancel();
      const from = getComputedStyle(ref.current).getPropertyValue(property);
      const normalizedTo = to; //measurePropertyForElement(ref.current, property, to);

      const spring = sampleSpring(
        {
          from: +from.slice(0, -2),
          to: +to.slice(0, -2),
          velocity: lastVelocity,
        },
        { stiffness: 100, friction: 5, mass: 1 },
      );
      // console.log({
      //   from,
      //   to,
      //   normalizedTo,
      //   lastVelocity,
      //   progress,
      //   spring,
      // });
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

const measurePropertyForElement = (
  elem: HTMLElement,
  propertyName: string,
  propertyValue: string,
) => {
  const s = getComputedStyle(elem);

  const propertyNameAsAny = propertyName as any;
  const original = elem.style[propertyNameAsAny];
  elem.style.setProperty(propertyName, propertyValue);
  const computed = s.getPropertyValue(propertyName);
  elem.style.setProperty(propertyName, original);

  return computed;
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
  useAnimate(ref, '--x', `${x}px`);
  useAnimate(ref, '--y', `${y}px`);
  // useEffect(() => {
  //   setTimeout(() => {
  //     console.log('swap');
  //     setX(300);
  //   }, 2000);
  // }, []);

  return (
    <div
      className="w-[40px] h-[40px] rounded-full bg-green-500"
      style={{ transform: 'translateX(var(--x)) translateY(var(--y))' }}
      ref={ref}
    />
  );
};

const meta = {
  title: 'Example/Velocity Waapi',
  component: Component,
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
