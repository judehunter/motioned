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

const Component = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { x, y } = useFollowPointer(ref);

  return (
    <m.div
      ref={ref}
      style={{
        transform: `translateX(var(--x)) translateY(var(--y))`,
      }}
      animate={{
        x: `${x}px`,
        y: `${y}px`,
        transition: {
          easing: 'spring',
          friction: 5,
        },
      }}
      className="w-16 h-16 bg-blue-500 rounded-full"
    />
  );
};

const meta = {
  title: 'Example/Follow Pointer Spring',
  component: Component,
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Motioned: Story = {};
