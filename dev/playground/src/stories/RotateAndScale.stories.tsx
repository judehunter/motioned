import { Meta, StoryObj } from '@storybook/react';
import { m } from 'motioned';

const Component = ({
  stiffness,
  friction,
  mass,
}: {
  stiffness: number;
  friction: number;
  mass: number;
}) => {
  return (
    <m.div
      initial={{
        rotateZ: '0deg',
        scaleX: 0,
        scaleY: 0,
      }}
      animate={{
        rotateZ: '180deg',
        scaleX: 1,
        scaleY: 1,
        transition: {
          easing: 'spring',
          stiffness,
          friction,
          mass,
        },
      }}
      className="w-32 h-32 bg-blue-500 rounded-lg"
    />
  );
};

const meta = {
  title: 'Spring/RotateAndScale',
  component: Component,
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Snappy: Story = {
  args: {
    stiffness: 150,
    friction: 15,
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
