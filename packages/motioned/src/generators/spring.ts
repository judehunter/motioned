import { Generator } from './generators.js';

/*
  Inspired by motion one (MIT License) and wobble (MIT License)
*/
export const makeSpringGenerator = (
  { from, to, velocity }: { from: number; to: number; velocity: number },
  {
    stiffness,
    friction,
    mass,
    restDistance = 0.005,
    restVelocity = 0.005,
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

  // Underdamped spring
  if (dampingRatio < 1) {
    const angularFreq =
      undampedAngularFreq * Math.sqrt(1 - dampingRatio * dampingRatio);

    const term1 = dampingRatio * undampedAngularFreq;
    const term2 = (-velocity + term1 * initialDelta) / angularFreq;
    const term3 = Math.exp(-term1);

    getPosition = (t) =>
      to -
      term3 ** t *
        (term2 * Math.sin(angularFreq * t) +
          initialDelta * Math.cos(angularFreq * t));
  }
  // Critically damped spring
  else if (dampingRatio === 1) {
    const term1 = -velocity + undampedAngularFreq * initialDelta;
    const term2 = Math.exp(-undampedAngularFreq);

    getPosition = (t) => to - term2 ** t * (initialDelta + term1 * t);
  }
  // Overdamped spring
  else {
    const omega2 =
      undampedAngularFreq * Math.sqrt(dampingRatio * dampingRatio - 1.0);
    const term1 = Math.exp(-dampingRatio * undampedAngularFreq);
    const term2 = -velocity + dampingRatio * undampedAngularFreq * initialDelta;
    const term3 = omega2 * initialDelta;

    getPosition = (t) =>
      to -
      (term1 ** t *
        (term2 * Math.sinh(omega2 * t) + term3 * Math.cosh(omega2 * t))) /
        omega2;
  }

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
