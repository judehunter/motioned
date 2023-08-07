import { Meta, StoryObj } from '@storybook/react';
import { m } from 'motioned';

const Component = () => {
  return (
    <m.div
      animate={{
        scaleX: [0, 1, 2],
        scaleY: [0, 1, 2],
        transition: {
          easing: ['ease-out', 'ease-in'],
        },
      }}
      className="w-32 h-32 bg-blue-500 rounded-lg"
    />
  );
};

const meta = {
  component: Component,
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
