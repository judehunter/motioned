import { Generator } from './generators.js';

/*
  Inspired by motion-one (MIT License)
*/
export const makeSpringGenerator = (
  { from, to, velocity }: { from: number; to: number; velocity: number },
  {
    stiffness,
    friction,
    mass,
    restDistance = 0.05,
    restVelocity = 0.1,
  }: {
    stiffness: number;
    friction: number;
    mass: number;
    restDistance?: number;
    restVelocity?: number;
  },
) => {
  const initialDelta = to - from;
  const undampedAngularFreq = Math.sqrt(stiffness / mass) / 1000;
  const dampingRatio = friction / (2 * Math.sqrt(stiffness * mass));

  let getPosition: (t: number) => number;

  if (dampingRatio < 1) {
    const angularFreq =
      undampedAngularFreq * Math.sqrt(1 - dampingRatio * dampingRatio);

    // Underdamped spring (bouncy)
    getPosition = (t) =>
      to -
      Math.exp(-dampingRatio * undampedAngularFreq * t) *
        (((-velocity + dampingRatio * undampedAngularFreq * initialDelta) /
          angularFreq) *
          Math.sin(angularFreq * t) +
          initialDelta * Math.cos(angularFreq * t));
  } else {
    // Critically damped spring
    getPosition = (t) => {
      return (
        to -
        Math.exp(-undampedAngularFreq * t) *
          (initialDelta + (-velocity + undampedAngularFreq * initialDelta) * t)
      );
    };
  }
  // TODO: Overdamped spring

  return ((t: number) => {
    const position = getPosition(t);
    const prevT = Math.max(t - 5, 0);
    const h = t - prevT;
    const velocity = h > 0 ? (position - getPosition(prevT)) / h : 0;

    const atRest =
      Math.abs(to - position) < restDistance &&
      Math.abs(velocity) < restVelocity;

    return {
      position,
      velocity,
      atRest,
    };
  }) satisfies Generator;
};
