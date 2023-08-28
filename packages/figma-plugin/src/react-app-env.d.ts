declare module "*.png";
declare module "*.svg";

type FigmaEffect =
  | {
      type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
    };

// todo before review: check all easing settings
type FigmaEasing = "EASE_IN" | "EASE_OUT" | "EASE_IN_AND_OUT" | "EASE_IN_BACK" | "EASE_IN_AND_OUT_BACK"

type FigmaReaction = {
  action: {
    destinationId: string;
    navigation: Navigation;
    transition:
      | { duration: number; easing: { type: FigmaEasing }; type: 'SMART_ANIMATE' }
      | {
          duration: number;
          easing: { type: 'CUSTOM_CUBIC_BEZIER', easingFunctionCubicBezier: { x1: number; x2: number; y1: number; y2: number } };
          type: 'SMART_ANIMATE'
        };
  },
  trigger: { type: "ON_CLICK" }
}