import { Meta, StoryObj } from '@storybook/react';

import { m } from 'motioned';
import { useState } from 'react';

const Switch = () => {
  const [state, setState] = useState<'off' | 'on'>('off');

  return (
    <div>
      <m.button
        className="w-[150px] h-[92px] py-[7px] pl-[8px] rounded-full cursor-pointer"
        variants={{
          off: {
            background: '#ddd',
            transition: {
              duration: 400,
              easing: 'ease',
            },
          },
          on: {
            background: '#9ED672',
            transition: {
              duration: 400,
              easing: 'ease',
            },
          },
        }}
        initial={state}
        animate={state}
        onClick={() => setState(state === 'off' ? 'on' : 'off')}
      >
        <m.div
          className="w-[77px] h-[77px] rounded-full shadow-[0px_4px_4px_0px_#00000040] bg-[#fdfdfd]"
          variants={{
            off: {
              x: 0,
              transition: {
                duration: 400,
                easing: 'circ-in-out',
              },
            },
            on: {
              x: 57,
              transition: {
                duration: 400,
                easing: 'circ-in-out',
              },
            },
          }}
          initial={state}
          animate={state}
        />
      </m.button>
    </div>
  );
};

const meta = {
  component: Switch,
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
