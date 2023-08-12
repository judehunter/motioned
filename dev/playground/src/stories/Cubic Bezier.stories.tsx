import { Meta, StoryObj } from '@storybook/react';

import { m } from 'motioned';

const Component = ({ easing }) => {
  return (
    <div>
      <m.svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        fill="#0a0606"
        viewBox="0 0 256 256"
        animate={{ x: 100, transition: { easing } }}
      >
        <path d="M240,112H211.31L168,68.69A15.86,15.86,0,0,0,156.69,64H44.28A16,16,0,0,0,31,71.12L1.34,115.56A8.07,8.07,0,0,0,0,120v48a16,16,0,0,0,16,16H33a32,32,0,0,0,62,0h66a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V128A16,16,0,0,0,240,112ZM44.28,80H156.69l32,32H23ZM64,192a16,16,0,1,1,16-16A16,16,0,0,1,64,192Zm128,0a16,16,0,1,1,16-16A16,16,0,0,1,192,192Zm48-24H223a32,32,0,0,0-62,0H95a32,32,0,0,0-62,0H16V128H240Z"></path>
      </m.svg>
    </div>
  );
};

const meta = {
  component: Component,
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  argTypes: {
    easing: {
      options: [
        'ease',
        'ease-in',
        'ease-out',
        'ease-in-out',
        'linear',
        'back-in',
        'back-out',
        'back-in-out',
        'circ-in',
        'circ-out',
        'circ-in-out',
      ],
      control: { type: 'select' },
    },
  },
};
