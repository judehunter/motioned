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

function rgbValueToHex(value: number) {
  return Math.floor(value * 255)
    .toString(16)
    .padStart(2, '0');
}

// todo: clean this function up
function buildColorString(paint: Paint) {
  if (paint.type === 'SOLID') {
    if (paint.opacity !== undefined && paint.opacity < 1) {
      return `rgba(${Math.floor(paint.color.r * 255)}, ${Math.floor(paint.color.g * 255)}, ${Math.floor(
        paint.color.b * 255
      )}, ${paint.opacity})`;
    }
    return `#${rgbValueToHex(paint.color.r)}${rgbValueToHex(paint.color.g)}${rgbValueToHex(paint.color.b)}`;
  } else if ('r' in paint && 'g' in paint) {
    return `rgba(${paint.r}, ${paint.g}, ${paint.b}, ${paint.a})`;
  }

  return '';
}

// code extracted and then modified: https://github.com/kazuyaseki/figma-to-react/blob/main/src/getCssDataForTag.ts#L113
// didn't cover all the cases...
export const convertAttributesToProps = (node: SceneNode) => {
  // todo before review: we probably only support components with auto layout enabled.
  // todo before review: type this later
  const props: Array<[string, any]> = [
    ['left', node.x],
    ['top', node.y],
  ];

  if (node.visible && node.type !== 'VECTOR') {
    // opacity -> opacity: 0.5;
    if (node.opacity < 1) {
      props.push(['opacity', opacity]);
    }

    if (node.effects.length > 0) {
      const shadow = node.effects.find((effect) => ['DROP_SHADOW', 'INNER_SHADOW'].includes(effect.type));
      if (shadow) {
        console.log('shadow', shadow.color);

        props.push([
          'boxShadow',
          `${shadow.type === 'INNER_SHADOW' ? 'inset ' : ''}${shadow.offset.x}px ${shadow.offset.y}px ${
            shadow.radius
          }px ${buildColorString(shadow.color)}`,
        ]);
      }

      const blur = node.effects.find((effect) => effect.type === 'LAYER_BLUR');
      if (blur) {
        props.push(['filter', `blur(${blur.radius}px)`]);
      }

      const backdrop = node.effects.find((effect) => effect.type === 'BACKGROUND_BLUR');
      if (backdrop) {
        props.push(['backdropFilter', `blur(${blur.radius}px)`]);
      }
    }

    // rotation -> transform: rotate(90deg);
    if ('rotation' in node && node.rotation !== 0) {
      props.push(['transform', `rotate(${Math.floor(node.rotation)}deg)`]);
    }

    if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') {
      // todo before review: support tuple, for now just support single value: https://github.com/kazuyaseki/figma-to-react/blob/main/src/getCssDataForTag.ts#L206C10-L206C31
      if (node.cornerRadius) {
        props.push(['borderRadius', `${node.cornerRadius}px`]);
      }

      if (node.layoutMode !== 'NONE') {
        props.push(['display', 'flex']);
        props.push(['flexDirection', node.layoutMode === 'HORIZONTAL' ? 'row' : 'column']);
        props.push(['justifyContent', justifyContentCssValues[node.primaryAxisAlignItems]]);
        props.push(['alignItems', alignItemsCssValues[node.counterAxisAlignItems]]);

        if (
          node.paddingTop === node.paddingBottom &&
          node.paddingTop === node.paddingLeft &&
          node.paddingTop === node.paddingRight
        ) {
          if (node.paddingTop > 0) {
            props.push(['padding', `${node.paddingTop}px`]);
          }
        } else if (node.paddingTop === node.paddingBottom && node.paddingLeft === node.paddingRight) {
          props.push(['padding', `${node.paddingTop}px ${node.paddingLeft}px`]);
        } else {
          props.push([
            'padding',
            `${node.paddingTop}px ${node.paddingRight}px ${node.paddingBottom}px ${node.paddingLeft}`,
          ]);
        }

        if (node.primaryAxisAlignItems !== 'SPACE_BETWEEN' && node.itemSpacing > 0) {
          props.push(['gap', `${node.itemSpacing}px`]);
        }
      } else {
        props.push(['height', `${Math.floor(node.height)}px`]);
        props.push(['width', `${Math.floor(node.width)}px`]);
      }

      if ((node.fills as Paint[]).length > 0 && (node.fills as Paint[])[0].type !== 'IMAGE') {
        const paint = (node.fills as Paint[])[0];
        props.push(['backgroundColor', buildColorString(paint)]);
      }

      if ((node.strokes as Paint[]).length > 0) {
        const paint = (node.strokes as Paint[])[0];
        props.push(['border', `${node.strokeWeight}px solid ${buildColorString(paint)}`]);
      }
    }
  }

  return Object.fromEntries(props);
};

export type FigmaNodeTypesWithProps = Partial<
  Record<
    string,
    {
      children: FigmaNodeTypesWithProps[];
      styles: Record<string, any>;
      name: string;
      id: string;
      figmaNodeType: string;
    }
  >
>;

export const convertFigmaNodes = (
  componentSetNode: SceneNode & { children?: SceneNode[]; id: string },
  variants: string[]
) => {
  // variant name -> styles
  const variantsMap = {};

  let currentVariant = variants[0];

  /** transverse through the figma document tree and replace each node with a react component */
  const buildFigmaNodeTree = (node: SceneNode & { children?: SceneNode[]; id: string }): FigmaNodeTypesWithProps => {
    // update current variant on a new component set.
    if (node.variantProperties) {
      currentVariant = Object.values(node.variantProperties)[0];
    }

    const singleNode = {
      children: node.children ? node.children.map(buildFigmaNodeTree) : null,
      styles: convertAttributesToProps(node),
      name: node.name,
      id: node.id,
      figmaNodeType: node.type,
    };

    if (node.type !== 'COMPONENT_SET') {
      // variantsMap[node.name][currentVariant] = singleNode.styles;
      if (variantsMap[node.name] === undefined) {
        variantsMap[node.name] = {};
      }

      variantsMap[node.name][currentVariant] = singleNode.styles;
    }

    return { [node.name]: singleNode };
  };

  const tree = buildFigmaNodeTree(componentSetNode);

  return { tree, variantStyles: variantsMap };
};

export const styleKeyDiff = (o1, o2) => {
  const isEqual = (o1, o2) => JSON.stringify(o1) === JSON.stringify(o2);

  // shallow
  return Object.entries(o1).reduce((diff, [key, value]) => (isEqual(o2[key], value) ? diff : [...diff, key]), []);
};
