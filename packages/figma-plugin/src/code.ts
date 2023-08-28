import { convertFigmaNodes } from './plugin/utils';

figma.showUI(__html__, { height: 690, width: 500 });

figma.ui.onmessage = (msg) => {};

figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection[0];

  if (selection?.type === 'FRAME') {
    const layerNode = convertFigmaNodes(selection);

    figma.ui.postMessage({
      type: 'onSelectionChange',
      message: {
        layerNode,
      },
    });
  } else {
    figma.ui.postMessage({
      type: 'onSelectionChange',
      message: {
        layerNode: null,
      },
    });
  }
});
