import { Meta, StoryObj } from '@storybook/react';
import { m } from 'motioned';

const Component = () => {
  return (
    <div>
      <m.div
        animate={{
          x: [0, 100, 150, 200],
          transition: {
            easing: ['ease-out', 'ease-in'],
            times: [0, 0.5, 0.75, 1],
            duration: 5000,
          },
        }}
        className="w-10 h-10 bg-blue-500 rounded-full"
      />
      <div className="relative">
        <hr className="border" style={{ width: '200px' }} />
        <div className="absolute" style={{ left: 100 }}>
          100
        </div>
        <div className="absolute" style={{ left: 150 }}>
          150
        </div>
        <div className="absolute" style={{ left: 200 }}>
          200
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
