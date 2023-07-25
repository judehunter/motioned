export type Generator = (t: number) => {
  position: number;
  velocity: number;
  atRest: boolean;
};

export const sampleGenerator = (
  generator: Generator,
  from: number,
  to: number,
  resolution = 60,
) => {
  const MAX_TIME = 10 * 1_000;
  const inverseResolution = 1_000 / resolution;
  let positions = [];
  let time = 0;
  for (; time < MAX_TIME; time += inverseResolution) {
    const { position, atRest } = generator(time);

    positions.push(position);
    if (atRest) {
      break;
    }
  }
  positions.push(to);

  const easingPositions = positions.map((p) =>
    to === from ? 1 : (p - from) / (to - from),
  );

  return {
    easingPositions,
    duration: time,
  };
};
