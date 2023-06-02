import { AnimateOptions, m } from 'motioned';
import { useState } from 'react';
import { motion } from 'framer-motion';

// const Anim1 = () => {
//   const [x, setX] = useState(10);
//   const [y, setY] = useState(10);
//   return (
//     <m.div
//       animate={{ translate: `${x}px ${y}px` }}
//       className="w-16 h-16 bg-green-500"
//       role="button"
//       onClick={() => {
//         setX(Math.random() * 50);
//         setY(Math.random() * 50);
//       }}
//     ></m.div>
//   );
// };

// const variants = <T extends string>(
//   v: Record<T, AnimateOptions>,
//   chosen: NoInfer<T>,
//   initial?: NoInfer<T>,
// ) => {
//   return {
//     initial: initial ? v[initial] : undefined,
//     animate: v[chosen],
//   };
// };

// const Anim2 = () => {
//   return (
//     <m.div
//       initial="small"
//       animate="large"
//       variants={{
// small: { rotate: -30, scale: 0, opacity: 0 },
// large: { rotate: 0, scale: 1, opacity: 1 },
//       }}
//       className="w-16 h-16 bg-green-500 rounded-tl-2xl"
//     ></m.div>
//   );
// };
const bounce = (x: number) => {
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
};
function easeInOutElastic(x: number): number {
  const c5 = (2 * Math.PI) / 4.5;

  return x === 0
    ? 0
    : x === 1
    ? 1
    : x < 0.5
    ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
    : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
}
// const Anim3 = () => {
//   const [variant, setVariant] = useState<'large' | 'small'>('large');
//   return (
//     <m.div
//       initial={variant}
//       animate={variant}
//       variants={{
//         small: {
//           scale: 1,
//           transition: {
//             easing: easeInOutElastic,
//             duration: 800,
//           },
//         },
//         large: {
//           scale: 3,
//           transition: {
//             easing: easeInOutElastic,
//             duration: 800,
//           },
//         },
//       }}
//       className="w-16 h-16 bg-green-500 rounded-tl-2xl"
//       onClick={() =>
//         setVariant((variant) => (variant === 'large' ? 'small' : 'large'))
//       }
//     >
//       {variant}
//     </m.div>
//   );
// };
const Anim3 = () => {
  const [variant, setVariant] = useState<'large' | 'small'>('small');
  return (
    <m.div
      initial={variant}
      animate={variant}
      variants={{
        small: {
          width: ['100px', '30vw', '50vw'],
          scale: 1,
          transition: {
            width: {
              easing: bounce,
              duration: 1000,
            },
            scale: {
              easing: 'ease-in-out',
              duration: 300,
            },
          },
        },
        large: {
          scale: 1,
          width: '100px',
          transition: {
            width: {
              easing: 'ease-out',
            },
            scale: {
              easing: 'ease-in-out',
              duration: 300,
            },
          },
        },
      }}
      className="w-16 h-16 bg-green-500 rounded-tl-2xl"
      onClick={() =>
        setVariant((variant) => (variant === 'large' ? 'small' : 'large'))
      }
    >
      {variant}
    </m.div>
  );
};

const Anim3F = () => {
  const [variant, setVariant] = useState<'large' | 'small'>('small');
  return (
    <motion.div
      initial={variant}
      animate={variant}
      variants={{
        small: {
          width: ['100px', '200px', '100px'],
          scale: 1,
          transition: {
            width: {
              ease: bounce,
              duration: 1,
            },
          },
        },
        large: {
          scale: 3,
        },
      }}
      className="w-16 h-16 bg-green-500 rounded-tl-2xl"
      onClick={() =>
        setVariant((variant) => (variant === 'large' ? 'small' : 'large'))
      }
    >
      {variant}
    </motion.div>
  );
};
// const Anim3F = () => {
//   const [variant, setVariant] = useState<number>(0);
//   return (
//     <div>
//       <div onClick={() => setVariant((v) => (v + 1) % 3)}>click</div>
//       <motion.div
//         initial={'' + variant}
//         animate={'' + variant}
//         variants={{
//           '0': { x: 0 },
//           '1': {
//             x: 100,
//           },
//           '2': { x: 100, y: 100 },
//         }}
//         transition={{ type: 'tween', duration: 1 }}
//         className="w-16 h-16 bg-green-500 rounded-tl-2xl"
//       >
//         {variant}
//       </motion.div>
//     </div>
//   );
// };
function App() {
  return (
    <>
      <div className="max-w-xl mx-auto p-20 flex flex-col gap-64">
        {/* <Anim1 /> */}
        {/* <Anim2 /> */}
        <Anim3 />
        <Anim3F />
      </div>
    </>
  );
}

export default App;
