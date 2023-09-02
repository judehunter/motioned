import { useEffect, useState } from 'react';
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

  return [filtered.r, filtered.g, filtered.b, filtered.a].filter(
    (f) => f !== undefined,
  );
};

/** convert figma color values to css format */
const buildColorString = (paint: Paint | { type: 'RGBA'; color: RGBA }) => {
  if (paint.type === 'SOLID') {
    if (paint.opacity && paint.opacity < 1) {
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

  return `${shadowType}${(effect as any).offset.x}px ${
    (effect as any).offset.y
  }px ${(effect as any).radius}px ${buildColorString({
    // todo: for when value is set to hex
    type: 'RGBA',
    color: (effect as any).color,
  })}`;
};

const guard = <T>(val: any, cond: boolean): val is T => cond;

type Writeable<T> = { -readonly [P in keyof T]: T[P] };
const dropReadonly = <T>(val: T) => val as Writeable<T>;

// convertion rules taken from https://github.com/kazuyaseki/figma-to-react/blob/main/src/getCssDataForTag.ts#L113
/** replaces figma node props with react style props */
export const convertNodePropsToStyles = (node: SceneNode) => {
  const styles: [string, any][] = [];

  // apply left and top values
  // todo: update for auto layout
  styles.push(['left', node.x], ['top', node.y]);

  if (node.visible && node.type !== 'VECTOR') {
    styles.push(['height', `${Math.floor(node.height)}px`]);
    styles.push(['width', `${Math.floor(node.width)}px`]);

    // opacity
    const opacity = 'opacity' in node ? node.opacity : undefined;
    if (opacity) {
      styles.push(['opacity', opacity]);
    }

    // figma effects -> shadow, blur, backdrop
    const effects =
      'effects' in node
        ? (node.effects as any as Array<FigmaEffect>)
        : undefined;

    if (effects?.length) {
      effects.forEach((eff) => {
        styles.push(
          match(eff)
            .with({ type: P.union('DROP_SHADOW', 'INNER_SHADOW') }, (shadow) =>
              dropReadonly(['boxShadow', buildBoxShadow(shadow)] as const),
            )
            .with({ type: 'LAYER_BLUR' }, (blur: any) =>
              dropReadonly(['filter', `blur(${blur.radius})`] as const),
            )
            .with({ type: 'BACKGROUND_BLUR' }, (backdrop: any) =>
              dropReadonly([
                'backdropFilter',
                `blur(${backdrop.radius}px)`,
              ] as const),
            )
            .run(),
        );
      });
    }

    // rotation -> transform: rotate(90deg);
    const rotation = 'rotation' in node ? node.rotation : undefined;
    if (typeof rotation === 'number' && rotation !== 0) {
      const rotationValue = Math.floor(rotation);

      if (rotationValue) {
        const relativeTransform = node.relativeTransform;

        const values = [...relativeTransform[0], ...relativeTransform[1]];
        // const angle = rotationValue * (Math.PI / 180);
        const angle = Math.atan2(values[1], values[0]) * (180 / Math.PI) + 90;

        styles.push(
          ['__rotate', `${+angle.toFixed(2)}deg`],
          ['__matrix', values.join(', ')],
        );

        console.log('s', styles[styles.length - 1]);
      }
    }

    // cornerRadius -> borderRadius
    // todo before review: cornerRadius can also be an array: https://github.com/kazuyaseki/figma-to-react/blob/main/src/getCssDataForTag.ts#L206C10-L206C31
    const cornerRadius =
      'cornerRadius' in node ? (node.cornerRadius as number) : undefined;
    if (cornerRadius) {
      styles.push(['borderRadius', `${cornerRadius}px`]);
    }

    // figma Fills -> background color
    const fills = 'fills' in node ? (node.fills as Paint[]) : undefined;
    if (fills && fills.length > 0 && fills[0].type !== 'IMAGE') {
      styles.push(['backgroundColor', buildColorString(fills[0])]);
    }

    // figma Stroke -> border
    const strokes = 'strokes' in node ? (node.strokes as Paint[]) : undefined;
    if (strokes && strokes.length > 0 && 'strokeWeight' in node) {
      styles.push([
        'border',
        `${node.strokeWeight as number}px solid ${buildColorString(
          strokes[0],
        )}`,
      ]);
    }

    // ---- apply styles for this node type
    if (
      guard<FrameNode>(
        node,
        ['FRAME', 'INSTANCE', 'COMPONENT'].includes(node.type),
      )
    ) {
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
          ...new Set([
            node.paddingTop,
            node.paddingRight,
            node.paddingBottom,
            node.paddingLeft,
          ]),
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
      }
    }
  }

  return Object.fromEntries(styles);
};

export type LayerNode<T extends SceneNode = SceneNode> = {
  children: LayerNode[] | null;
  styles: Record<string, any>;
  name: string;
  id: string;
  type: T['type'];
};

/**
 * generate node structure with children and variants
 */
export const convertFigmaNodes = (node: SceneNode) => {
  const styles = convertNodePropsToStyles(node);

  return {
    children: 'children' in node ? node.children.map(convertFigmaNodes) : null,
    styles,
    name: node.name,
    id: node.id,
    type: node.type,
  } satisfies LayerNode;
};

export const useWatch = (value: any, onChange: () => void) => {
  const [firstRender, setFirstRender] = useState(true);
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value || firstRender) {
    setFirstRender(false);
    setPrevValue(value);
    onChange();
  }
};
