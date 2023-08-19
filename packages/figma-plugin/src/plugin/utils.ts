import { P, match } from 'ts-pattern';

const justifyContentCssValues = {
  MIN: 'flex-start',
  MAX: 'flex-end',
  CENTER: 'center',
  SPACE_BETWEEN: 'space-between',
};

const alignItemsCssValues = {
  MIN: 'flex-start',
  MAX: 'flex-end',
  CENTER: 'center',
};

const filterRGBA = (
  color: RGBA | RGB,
  iterator: (value: number) => number | string,
) => {
  // run iterator against each key value
  const filtered = Object.fromEntries(
    Object.entries(color).map(([key, val]) => [key, iterator(val)]),
  );
  return [filtered.r, filtered.g, filtered.b, filtered.a].filter(Boolean);
};

/** convert figma color values to css format */
const buildColorString = (paint: Paint | { type: 'RGBA'; color: RGBA }) => {
  if (paint.type === 'SOLID') {
    if (paint.opacity < 1) {
      const filtered = filterRGBA(paint.color, (val) => Math.floor(val * 255));
      return `rgba(${filtered.join(',')}, ${paint.opacity})`;
    }

    // convert each key value to a hex
    const filtered = filterRGBA(paint.color, (val) =>
      Math.floor(val * 255)
        .toString(16)
        .padStart(2, '0'),
    );

    return `#${filtered.join('')}`;
  } else if (paint.type === 'RGBA') {
    return `rgba(${filterRGBA(paint.color, (val) => val).join(',')})`;
  }
};

/** convert figma shadow effect to css box-shadow */
const buildBoxShadow = (effect: FigmaEffect) => {
  const shadowType = effect.type === 'INNER_SHADOW' ? 'inset ' : '';

  return `${shadowType}${effect.offset.x}px ${effect.offset.y}px ${
    effect.radius
  }px ${buildColorString({
    // todo: for when value is set to hex
    type: 'RGBA',
    color: effect.color,
  })}`;
};

// convertion rules taken from https://github.com/kazuyaseki/figma-to-react/blob/main/src/getCssDataForTag.ts#L113
/** replaces figma node props with react style props */
export const convertNodePropsToStyles = (node: SceneNode) => {
  const styles = [];

  // apply left and top values
  // todo: update for auto layout
  styles.push(['left', node.x], ['top', node.y]);

  if (node.visible && node.type !== 'VECTOR') {
    // opacity
    const opacity = node.opacity as number | undefined;
    if (opacity < 1) {
      styles.push(['opacity', opacity]);
    }

    // figma effects -> shadow, blur, backdrop
    const effects = node.effects as Array<FigmaEffect>;

    if (effects.length > 0) {
      effects.forEach((eff) => {
        styles.push(
          match(eff)
            .with(
              { type: P.union('DROP_SHADOW', 'INNER_SHADOW') },
              (shadow) => ['boxShadow', buildBoxShadow(shadow)],
            )
            .with({ type: 'LAYER_BLUR' }, (blur) => [
              'filter',
              `blur(${blur.radius})`,
            ])
            .with({ type: 'BACKGROUND_BLUR' }, (backdrop) => {
              ['backdropFilter', `blur(${backdrop.radius}px)`];
            })
            .run(),
        );
      });
    }

    // rotation -> transform: rotate(90deg);
    const rotation = node.rotation as number | undefined;
    if (typeof rotation === 'number' && rotation !== 0) {
      styles.push(['transform', `rotate(${Math.floor(rotation)}deg)`]);
    }

    // ---- apply styles for this node type
    if (['FRAME', 'INSTANCE', 'COMPONENT'].includes(node.type)) {
      // cornerRadius -> borderRadius
      // todo before review: cornerRadius can also be an array: https://github.com/kazuyaseki/figma-to-react/blob/main/src/getCssDataForTag.ts#L206C10-L206C31
      const cornerRadius = node.cornerRadius as number;
      if (cornerRadius) {
        styles.push(['borderRadius', `${cornerRadius}px`]);
      }

      // handle layout modes
      const layoutMode = node.layoutMode as 'NONE' | 'AUTO' | 'HORIZONTAL';
      if (layoutMode !== 'NONE') {
        styles.push(['display', 'flex']);
        styles.push([
          'flexDirection',
          layoutMode === 'HORIZONTAL' ? 'row' : 'column',
        ]);
        styles.push([
          'justifyContent',
          justifyContentCssValues[node.primaryAxisAlignItems],
        ]);
        styles.push([
          'alignItems',
          alignItemsCssValues[node.counterAxisAlignItems],
        ]);

        // padding
        const padding = [
          ...new Set(
            node.paddingTop,
            node.paddingRight,
            node.paddingBottom,
            node.paddingLeft,
          ),
        ];
        if (padding.some((p) => p > 0)) {
          styles.push(['padding', padding.map((p) => `${p}px`).join(' ')]);
        }

        // figma itemSpacing -> gap
        if (
          node.primaryAxisAlignItems !== 'SPACE_BETWEEN' &&
          node.itemSpacing > 0
        ) {
          styles.push(['gap', `${node.itemSpacing}px`]);
        }
      } else {
        styles.push(['height', `${Math.floor(node.height)}px`]);
        styles.push(['width', `${Math.floor(node.width)}px`]);
      }

      // figma Fills -> background color
      const fills = node.fills as Paint[];
      if (fills.length > 0 && fills[0].type !== 'IMAGE') {
        styles.push(['backgroundColor', buildColorString(fills[0])]);
      }

      // figma Stroke -> border
      const strokes = node.strokes as Paint[];
      if (strokes.length > 0) {
        styles.push([
          'border',
          `${node.strokeWeight}px solid ${buildColorString(strokes[0])}`,
        ]);
      }
    }
  }

  return Object.fromEntries(styles);
};

export type LayerNode = {
  children: LayerNode[];
  styles: Record<string, any>;
  name: string;
  id: string;
  figmaNodeType: string;
};

/**
 * generate node structure with children and variants
 */
export const convertFigmaNodes = (
  componentSetNode: SceneNode & { children?: SceneNode[]; id: string },
) => {
  // transverse through the figma document tree and replace each node with a react component
  const buildFigmaNodeTree = (
    node: SceneNode & { children?: SceneNode[]; id: string },
  ): LayerNode => {
    const styles = convertNodePropsToStyles(node);

    return {
      children: node.children ? node.children.map(buildFigmaNodeTree) : null,
      styles,
      name: node.name,
      id: node.id,
      figmaNodeType: node.type,
    };
  };

  return buildFigmaNodeTree(componentSetNode);
};
