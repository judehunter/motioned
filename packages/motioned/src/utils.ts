export const registerCSSProperties = () => {
  try {
    (CSS as any).registerProperty({
      name: '--x',
      syntax: '<length-percentage>',
      inherits: false,
      initialValue: '0px',
    });

    (CSS as any).registerProperty({
      name: '--y',
      syntax: '<length-percentage>',
      inherits: false,
      initialValue: '0px',
    });
  } catch (e) {}
};

export const asSelf = <TOriginal, TCast>(
  original: TOriginal,
  cast: (original: TOriginal) => TCast,
) => original as any as TCast;
