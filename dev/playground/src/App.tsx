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
  const [variant, setVariant] = useState<'fast' | 'slow'>('fast');
  return (
    <m.div
      initial={variant}
      animate={variant}
      variants={{
        slow: { scale: [null, 2, 1] },
        fast: { scale: [null, 2, 3] },
      }}
      className="w-16 h-16 bg-green-500 rounded-tl-2xl"
      onClick={() =>
        setVariant((variant) => (variant === 'fast' ? 'slow' : 'fast'))
      }
    >
      {variant}
    </m.div>
  );
};
const Anim3F = () => {
  const [variant, setVariant] = useState<'fast' | 'slow'>('fast');
  return (
    <motion.div
      initial={variant}
      animate={variant}
      variants={{
        slow: { scale: [3, 2, 1] },
        fast: {
          scale: [1, 2, 3],
        },
      }}
      className="w-16 h-16 bg-green-500 rounded-tl-2xl"
      onClick={() =>
        setVariant((variant) => (variant === 'fast' ? 'slow' : 'fast'))
      }
    >
      {variant}
    </motion.div>
  );
};
function App() {
  return (
    <>
      <div className="max-w-xl mx-auto p-20 flex flex-col gap-5">
        {/* <Anim1 /> */}
        {/* <Anim2 /> */}
        <Anim3 />
        <Anim3F />
      </div>
    </>
  );
}

export default App;
