import { AnimateOptions, m } from 'motioned';
import { useState } from 'react';

const Anim1 = () => {
  const [x, setX] = useState(10);
  const [y, setY] = useState(10);
  return (
    <m.div
      animate={{ x, y }}
      className="w-16 h-16 bg-green-500"
      role="button"
      onClick={() => {
        setX(Math.random() * 50);
        setY(Math.random() * 50);
      }}
    ></m.div>
  );
};

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

const Anim2 = () => {
  return (
    <m.div
      initial="small"
      animate="large"
      variants={{
        small: { rotate: -30, scale: 0, opacity: 0 },
        large: { rotate: 0, scale: 1, opacity: 1 },
      }}
      className="w-16 h-16 bg-green-500 rounded-tl-2xl"
    ></m.div>
  );
};
function App() {
  return (
    <>
      <div className="max-w-xl mx-auto p-20 flex flex-col gap-5">
        <Anim1 />
        <Anim2 />
      </div>
    </>
  );
}

export default App;
