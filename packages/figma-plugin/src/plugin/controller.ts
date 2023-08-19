import { convertFigmaNodes, styleKeyDiff } from './utils';

figma.showUI(__html__, { height: 500, width: 500 });

figma.ui.onmessage = (msg) => {};

/**
 * takes each node styles and generates a difference between the variants,
 * ... returns variants with just the values that have changed.
 *
 * e.g.
 * ```ts
 * Frame5: { on: { opacity: 1, height: "100px" },  off: { opacity: 0, height: "100px" } }
 * // diff
 * Frame5: { on: { opacity: 1 }, off: { opacity: 0 } }
 *```
 * */
// todo before review: add proper types here...
const createAnimatePropsPerNode = (
  variantsList: string[],
  stylesPerVariant: Record<string, any>,
  transitionPerVariant: Record<string, any>
) => {
  const variants = {};

  // todo: support more than 2 variants, for now we assuming there is just 2

  // loop through each variant for each layer
  for (const [layerName, layerVariants] of Object.entries(stylesPerVariant)) {
    // todo before review: use a different data stucture (try Map)
    const styleFromVariants = Object.values(layerVariants);

    if (styleFromVariants.length > 1) {
      // get the difference between styles 1, 2
      let diff = styleKeyDiff(...styleFromVariants);

      // exclude x and y animation for component variants
      if (layerName === 'COMPONENT_ROOT') {
        diff = diff.filter((prop) => !['top', 'left'].includes(prop));
      }

      if (diff.length > 0) {
        variants[layerName] = Object.fromEntries(variantsList.map((a) => [a, {}]));

        for (const variantName of variantsList) {
          // create key -> value map for changed values, propToAnimate -> value
          const styleProps = diff.map((propToAnimate) => [propToAnimate, layerVariants[variantName][propToAnimate]]);

          // apply transition key to variant
          const transtion = transitionPerVariant[variantName];
          if (transtion) {
            styleProps.push(['transition', transitionPerVariant[variantName]]);
          }

          variants[layerName][variantName] = Object.fromEntries(styleProps);
        }
      }
    }
  }

  return variants;
};

figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection[0];

  console.log('select', selection);

  if (selection.type === 'COMPONENT_SET') {
    const variantsList = Object.values(selection.variantGroupProperties)[0].values;

    const nodes = convertFigmaNodes(selection, variantsList);

    const variantsPerNode = createAnimatePropsPerNode(variantsList, nodes.stylesPerVariant, nodes.transitionPerVariant);

    figma.ui.postMessage({
      type: 'onSelectionChange',
      message: {
        variantsPerNode,
        variantsList,
        // only render the first component in the component set.
        componentNode: nodes.tree[selection.name].children[0],
      },
    });
  }
});
