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
const Anim3 = () => {
  const [variant, setVariant] = useState<'large' | 'small'>('large');
  return (
    <m.div
      initial={variant}
      animate={variant}
      variants={{
        small: { scale: 1, transition: { easing: (t) => t } },
        large: { scale: 2, transition: { easing: (t) => t } },
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
  const [variant, setVariant] = useState<number>(0);
  return (
    <div>
      <div onClick={() => setVariant((v) => (v + 1) % 3)}>click</div>
      <motion.div
        initial={'' + variant}
        animate={'' + variant}
        variants={{
          '0': { x: 0 },
          '1': {
            x: 100,
          },
          '2': { x: 100, y: 100 },
        }}
        transition={{ type: 'tween', duration: 1 }}
        className="w-16 h-16 bg-green-500 rounded-tl-2xl"
      >
        {variant}
      </motion.div>
    </div>
  );
};
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
