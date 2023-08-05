import { Meta, StoryObj } from '@storybook/react';
import { m } from 'motioned';
import { useState } from 'react';

const Component = ({
  easing,
  duration,
}: {
  easing: (t: number) => number;
  duration: number;
}) => {
  const [x, setX] = useState(0);
  return (
    <div>
      <div className="bg-slate-100 transform w-[120px] p-2 rounded-full box-content">
        <m.div
          initial={{ x: 0 }}
          animate={{
            x,
            transition: {
              easing,
              duration,
            },
          }}
          className="w-[20px] h-[20px] bg-teal-700 rounded-full"
        />
      </div>
      <button
        onClick={() => setX((x) => (x === 0 ? 100 : 0))}
        className="mt-5 bg-slate-100 text-teal-700 font-semibold p-2 rounded-full w-full"
      >
        Set x to {x === 0 ? 100 : 0}
      </button>
    </div>
  );
};

const meta = {
  component: Component,
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const easeOutBounce: Story = {
  args: {
    easing: (x) => {
      const n1 = 7.5625;
      const d1 = 2.75;

      if (x < 1 / d1) {
        return n1 * x * x;
      } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
      } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
      } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
      }
    },
    duration: 1000,
  },
};

export const easeInOutQuint: Story = {
  args: {
    easing: (x) => {
      return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
    },
    duration: 1000,
  },
};

export const easeInOutElastic: Story = {
  args: {
    easing: (x) => {
      const c5 = (2 * Math.PI) / 4.5;

      return x === 0
        ? 0
        : x === 1
        ? 1
        : x < 0.5
        ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
        : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 +
          1;
    },
    duration: 1000,
  },
};
