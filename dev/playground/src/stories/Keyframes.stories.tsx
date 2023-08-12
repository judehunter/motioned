import { Meta, StoryObj } from '@storybook/react';

import { m } from 'motioned';

const Component = () => {
  return (
    <div>
      <div className="h-1 rounded-md w-10 mb-2 bg-gray-300 mx-auto" />
      <div className="w-32 border-2 border-gray-300 p-2 rounded-2xl">
        <div className="relative h-60">
          <m.div
            animate={{
              height: [0, '80%', '98%', '80%', '50%'],
              backgroundColor: [
                '#d1d5db',
                '#1f2937',
                '#030712',
                '#9ca3af',
                '#d1d5db',
              ],
              transition: {
                easing: [
                  // ease out circ
                  [0, 0.55, 0.45, 1],
                  'ease-in-out',
                  (t) => t ** 10,
                  // ease in out back
                  [0.68, -0.6, 0.32, 1.6],
                ],
                times: [0, 0.5, 0.6, 0.9, 1],
                duration: 8000,
              },
            }}
            className="w-full bg-gray-800 rounded-lg absolute bottom-0"
          />
        </div>
      </div>
    </div>
  );
};

const meta = {
  component: Component,
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
