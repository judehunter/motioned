import { Meta, StoryObj } from '@storybook/react';
import throttle from 'lodash.throttle';
import { RefObject, useEffect, useRef, useState } from 'react';

class SpringSimulation {
  position: number;
  constructor(
    from: number,
    public velocity: number,
    public to: number,
    public stiffness: number,
    public friction: number,
    public mass: number,
  ) {
    this.position = from;
  }

  /**
   * @param deltaT in ms
   */
  next(deltaT: number) {
    const displacement = this.position - this.to;
    const springForce = -this.stiffness * 0.000001 * displacement;
    const frictionForce = -this.friction * 0.001 * this.velocity;
    const acceleration = (springForce + frictionForce) / this.mass;

    this.velocity += acceleration * deltaT;
    const deltaPosition = this.velocity * deltaT;
    this.position += deltaPosition;

    const DELTA = 0.01;
    const rest =
      Math.abs(displacement) < DELTA && Math.abs(this.velocity) < DELTA;

    return { position: this.position, velocity: this.velocity, rest };
  }
}

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

// const sampleSpring = (
//   {
//     stiffness,
//     friction,
//     mass,
//   }: {
//     stiffness: number;
//     friction: number;
//     mass: number;
//   },
//   startVelocity: number,
// ) => {
//   // x is normalized to be |a - b| = 1,
//   // since the spring is an easing function,
//   // and so it returns values 0 through 1.
//   let x = 1;
//   let velocity = startVelocity;

//   // how often to sample, in seconds
//   const INVERSE_SAMPLE_RESOLUTION = 1 / SAMPLE_RESOLUTION;
//   const MAX_TIME = 10;

//   let points = [];
//   let velocities = [velocity];
//   let lastDisplacement = 0;
//   let time = 0;
//   for (; time < MAX_TIME; time += INVERSE_SAMPLE_RESOLUTION) {
//     const acceleration = (-stiffness * x - friction * velocity) / mass;
//     velocity += acceleration * INVERSE_SAMPLE_RESOLUTION;
//     velocities.push(velocity);
//     const displacement = velocity * INVERSE_SAMPLE_RESOLUTION;
//     x += displacement;
//     points.push(1 - x);

//     // check if we've reached an inflection point,
//     // and break if it's close enough to the equilibrium
//     let DELTA = 0.01;
//     if (displacement * lastDisplacement < 0 && Math.abs(x) < DELTA) {
//       break;
//     }
//     lastDisplacement = displacement;
//   }
//   points.push(1);

//   return { duration: time * 1000, points, velocities };
// };

export const useAnimate = (
  ref: any,
  property: string,
  to: number,
  cb: (value: number) => void,
) => {
  const lastVelocity = useRef(0);
  const raf = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
    }
    const spring = new SpringSimulation(
      +getComputedStyle(ref.current).getPropertyValue(property).slice(0, -2),
      lastVelocity.current,
      to,
      100,
      5,
      1,
    );
    let lastTime = performance.now();
    raf.current = requestAnimationFrame(function fn() {
      const now = performance.now();
      const deltaT = now - lastTime;
      lastTime = now;
      const { position, velocity, rest } = spring.next(deltaT);
      lastVelocity.current = velocity;
      if (rest) {
        console.log('rest');
        return;
      }
      cb(position);
      requestAnimationFrame(fn);
    });
  }, [to]);
};

const Component = () => {
  const ref = useRef<HTMLDivElement>(null!);
  const { x, y } = useFollowPointer(ref, () => {});
  useAnimate(ref, '--x', x, (curX) =>
    ref.current.style.setProperty('--x', `${curX}px`),
  );
  useAnimate(ref, '--y', y, (curY) =>
    ref.current.style.setProperty('--y', `${curY}px`),
  );

  return (
    <div
      className="w-[40px] h-[40px] rounded-full bg-green-500"
      style={{ transform: 'translateX(var(--x)) translateY(var(--y))' }}
      ref={ref}
    />
  );
};

const meta = {
  title: 'Example/React Spring Experiments',
  component: Component,
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
