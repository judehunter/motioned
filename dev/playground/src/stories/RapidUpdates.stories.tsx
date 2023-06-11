import { Meta, StoryObj } from '@storybook/react';
import { m } from 'motioned';
import { RefObject, useEffect, useRef, useState } from 'react';

const Component = () => {
  const [current, setCurrent] = useState(0);
  const max = 1000;

  const interval = 10;
  const duration = 10000;
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((current) => current + (interval / duration) * max);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const startTime = useRef(Date.now());

  const [endTime, setEndTime] = useState<undefined | number>();
  if (current >= max && !endTime) {
    setEndTime(Date.now());
  }

  return (
    <div>
      <div>{Date.now() - startTime.current}</div>
      <div>{endTime ? endTime - startTime.current : ''}</div>
      <m.div
        animate={{
          width: [current, max],
          transition: {
            easing: 'linear',
            duration: duration * ((max - current) / max),
          },
        }}
        className="h-16 bg-blue-500 rounded"
      />
    </div>
  );
};

const meta = {
  title: 'Example/Rapid Updates',
  component: Component,
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
