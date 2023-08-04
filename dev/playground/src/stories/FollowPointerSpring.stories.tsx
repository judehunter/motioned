import { Meta, StoryObj } from '@storybook/react';
import { m } from 'motioned';
import { RefObject, useEffect, useRef, useState } from 'react';
import throttle from 'lodash.throttle';

function useFollowPointer(ref: RefObject<HTMLElement>) {
  const [point, setPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const handlePointerMove = throttle(({ clientX, clientY }: MouseEvent) => {
      const element = ref.current!;

      const x = clientX - element.offsetLeft - element.offsetWidth / 2;
      const y = clientY - element.offsetTop - element.offsetHeight / 2;
      setPoint({ x, y });
    }, 0);

    window.addEventListener('pointermove', handlePointerMove);

    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  return point;
}

const Component = ({
  stiffness,
  friction,
  mass,
}: {
  stiffness: number;
  friction: number;
  mass: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { x, y } = useFollowPointer(ref);

  return (
    <m.div
      ref={ref}
      animate={{
        x: `${x}px`,
        y: `${y}px`,
        transition: {
          easing: 'spring',
          stiffness,
          friction,
          mass,
        },
      }}
      className="w-32 h-32 bg-blue-500 rounded-full"
    />
  );
};

const meta = {
  title: 'Spring/Follow Pointer',
  component: Component,
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Swing: Story = {
  args: {
    stiffness: 100,
    friction: 5,
    mass: 1,
  },
};

export const Sluggish: Story = {
  args: {
    stiffness: 50,
    friction: 3,
    mass: 2,
  },
};
