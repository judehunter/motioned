/**
 * A linear generator is a generator that moves from one point to another at a constant speed.
 * The mathematical function used is f(t) = from + (to - from) * t / duration
 * 
 * Example:
 * Given a duration of 1000ms, a from of 100 and a to of 200, the generator returns
 * 100 at t = 0ms, 150 at t = 500ms and 200 at t = 1000ms
 */
export const makeLinearGenerator = ({
  from,
  to,
  duration,
}: {
  from: number;
  to: number;
  duration: number;
}) => {
  const delta = to - from;
  const velocity = delta / duration;

  return (t: number) => {
    const position = from + velocity * t;
    const atRest = t >= duration;

    return {
      position,
      velocity,
      atRest,
    };
  };
};
