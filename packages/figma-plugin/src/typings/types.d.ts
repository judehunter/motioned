declare module '*.svg' {
  const content: any;
  export default content;
}

type FigmaEffect =
  | {
      type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
    } & Record<string, any>;

  