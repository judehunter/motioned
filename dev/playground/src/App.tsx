import { AnimateOptions, m } from 'motioned';
import { useEffect, useState } from 'react';
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
const sampleSpring = ({
  stiffness,
  friction,
  mass,
}: {
  stiffness: number;
  friction: number;
  mass: number;
}) => {
  // x is normalized to be |a - b| = 1,
  // since the spring is an easing function,
  // and so it returns values 0 through 1.
  let x = 1;
  let velocity = 0;

  // how often to sample, in seconds
  const INVERSE_SAMPLE_RESOLUTION = 1 / 60;
  const MAX_TIME = 10;

  let points = [0];
  let lastDisplacement = 0;
  let time = 0;
  for (; time < MAX_TIME; time += INVERSE_SAMPLE_RESOLUTION) {
    const acceleration = (-stiffness * x - friction * velocity) / mass;
    velocity += acceleration * INVERSE_SAMPLE_RESOLUTION;
    const displacement = velocity * INVERSE_SAMPLE_RESOLUTION;
    x += displacement;
    points.push(1 - x);

    // check if we've reached an inflection point,
    // and break if it's close enough to the equilibrium
    let CLOSE_ENOUGH = 0.01;
    if (displacement * lastDisplacement < 0 && Math.abs(x) < CLOSE_ENOUGH) {
      break;
    }
    lastDisplacement = displacement;
  }
  points.push(1);

  return { duration: time * 1000, points };
};
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
  const spring = sampleSpring({ friction: 10, stiffness: 100, mass: 1 });
  const easing = (t: number) =>
    spring.points[Math.floor((spring.points.length - 1) * t)];
  return (
    <m.div
      initial={variant}
      animate={variant}
      variants={{
        small: {
          width: '100px',
          transition: {
            easing,
            duration: spring.duration,
          },
        },
        large: {
          width: '200px',
          transition: {
            easing,
            duration: spring.duration,
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
          width: 100,
        },
        large: {
          width: 200,
        },
      }}
      transition={{
        type: 'spring',
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
const Anim4F = () => {
  const [width, setWidth] = useState<number>(100);
  useEffect(() => {
    const interval = setInterval(() => {
      setWidth((w) => w + 10);
    }, 400);
    return () => clearInterval(interval);
  });
  return (
    <motion.div
      animate={{
        width,
      }}
      className="w-16 h-16 bg-green-500 rounded-tl-2xl"
      onClick={() => setWidth((x) => x + 50)}
    >
      {width}
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
