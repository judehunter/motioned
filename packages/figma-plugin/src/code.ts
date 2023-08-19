import { convertFigmaNodes } from './plugin/utils';

figma.showUI(__html__, { height: 500, width: 500 });

figma.ui.onmessage = (msg) => {};

figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection[0];

  const layerNode = convertFigmaNodes(selection);

  figma.ui.postMessage({
    type: 'onSelectionChange',
    message: {
      layerNode,
    },
  });
});
