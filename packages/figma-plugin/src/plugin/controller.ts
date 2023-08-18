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
const createAnimatePropsPerNode = (nodeStyles: Record<string, any>, variantsList: string[]) => {
  const variants = {};

  // todo: support more than 2 variants, for now we assuming there is just 2
  for (const [nodeName, nodeVariants] of Object.entries(nodeStyles)) {
    // todo before review: use a different data stucture (try Map)
    const styleFromVariants = Object.values(nodeVariants);

    if (styleFromVariants.length > 1) {
      // get the difference between styles 1, 2
      const diff = styleKeyDiff(...styleFromVariants);

      if (diff.length > 0) {
        variants[nodeName] = Object.fromEntries(variantsList.map((a) => [a, {}]));

        for (const v of variantsList) {
          variants[nodeName][v] = Object.fromEntries(
            diff.map((propToAnimate) => [propToAnimate, nodeVariants[v][propToAnimate]])
          );
        }
      }
    }
  }

  return variants;
};

figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection[0];

  if (selection.type === 'COMPONENT_SET') {
    const variantsList = Object.values(selection.variantGroupProperties)[0].values;

    const nodes = convertFigmaNodes(selection, variantsList);

    const variantsPerNode = createAnimatePropsPerNode(nodes.stylesPerVariant, variantsList);

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
