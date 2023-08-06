import { Meta, StoryObj } from '@storybook/react';
import { m } from 'motioned';
import { useState } from 'react';

const Component = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const CARDS = 5;
  return (
    <div className="flex items-center">
      {[...new Array(CARDS)].map((_, i) => (
        <m.div
          key={i}
          className="pointer-events-none relative"
          variants={{
            selected: {
              y: -60,
              scaleX: 1.2,
              scaleY: 1.2,
              zIndex: 999,
              margin: '-10px',
              transition: {
                easing: 'spring',
                stiffness: 150,
                friction: 15,
                zIndex: {
                  easing: 'step-start',
                },
                margin: {
                  delay: 100,
                },
              },
            },
            initial: {
              y: 0,
              scaleX: 1,
              scaleY: 1,
              zIndex: 'auto',
              margin: '-20px',
              transition: {
                easing: 'spring',
                friction: 50,
                stiffness: 200,
                zIndex: {
                  easing: 'step-start',
                },
                margin: {
                  delay: 100,
                },
              },
            },
          }}
          animate={selected === i ? 'selected' : 'initial'}
          initial={'initial'}
        >
          <div
            className="bg-slate-100 bg-opacity-95 w-[100px] h-[150px] rounded-xl border-4 border-teal-700 relative pointer-events-auto"
            style={{
              transform: `rotateZ(${
                (i - (CARDS / 2 - 0.5)) * 10
              }deg) translateY(${Math.abs(i - (CARDS / 2 - 0.5)) ** 2 * 5}px)`,
              transformOrigin: 'center 100%',
            }}
            onMouseOver={() => setSelected(i)}
            onMouseOut={() => setSelected(null)}
          >
            <div className="text-teal-700 font-bold text-xl pl-3 pt-2">
              {i + 1}
            </div>
            <div className="text-teal-700 font-bold text-xl absolute bottom-0 left-0 transform rotate-180 w-full pl-3 pt-2">
              {i + 1}
            </div>
          </div>
        </m.div>
      ))}
    </div>
  );
};

const meta = {
  component: Component,
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
