import React from 'react';

import { m } from 'motioned';

import type { LayerNode } from '../plugin/utils';

type PluginMessage = {
  type: 'onSelectionChange';
  message: {
    layerNode: LayerNode;
  };
};

const Hierarchy = ({
  layer,
}: {
  layer: PluginMessage['message']['layerNode'];
}) => {
  return (
    <div>
      <div>
        {'-'}
        {layer.name}
      </div>
      {layer.children?.length > 0 ? (
        <div className="pl-4">
          {layer.children?.map((l) => (
            <Hierarchy key={l.id} layer={l} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

function App() {
  const [layerNode, setLayerNode] =
    React.useState<PluginMessage['message']['layerNode']>(null);

  React.useEffect(() => {
    window.onmessage = (event: { data: { pluginMessage: PluginMessage } }) => {
      const { type, message } = event.data.pluginMessage;
      if (type === 'onSelectionChange') {
        setLayerNode(message.layerNode);
      }
    };
  }, []);

  return (
    <div style={{ paddingTop: 4 }}>
      <div className="flex justify-center">
        <div>
          {layerNode ? (
            <>
              {
                <m.div
                  key={layerNode.id}
                  style={{
                    position: 'relative',
                    ...layerNode.styles,
                    top: 0,
                    left: 0,
                  }}
                  animate={{}}
                >
                  {/* Layer children */}
                  {layerNode.children?.map((child) => {
                    return (
                      <m.div
                        key={child.id}
                        style={{ position: 'absolute', ...child.styles }}
                        animate={{}}
                      />
                    );
                  })}
                </m.div>
              }
            </>
          ) : (
            <div>Select a layer</div>
          )}
        </div>
      </div>

      {layerNode ? <Hierarchy layer={layerNode} /> : null}
    </div>
  );
}

export default App;
