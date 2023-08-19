import React from 'react';

import { m } from 'motioned';

import type { FigmaNodeTypesWithProps } from '../plugin/utils';

type PluginMessage = {
  type: 'onSelectionChange';
  message: {
    layerNode: FigmaNodeTypesWithProps;
  };
};

const Hierarchy = ({
  layer,
}: {
  layer: PluginMessage['message']['layerNode'][string];
}) => {
  return (
    <div>
      <div>
        {'-'}
        {layer.name}
      </div>
      {layer?.children.length > 0 ? (
        <div className="pl-4">
          {layer.children.map((l) => (
            <Hierarchy layer={Object.values(l)[0]} />
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
              {Object.entries(layerNode).map(([_, layer]) => (
                <m.div
                  key={layer.id}
                  style={{
                    position: 'relative',
                    ...layer.styles,
                    top: 0,
                    left: 0,
                  }}
                  animate={{}}
                >
                  {/* Layer children */}
                  {layer.children.map((child) => {
                    const [[_, opts]] = Object.entries(child);

                    return (
                      <m.div
                        key={opts.id}
                        style={{ position: 'absolute', ...opts.styles }}
                        animate={{}}
                      />
                    );
                  })}
                </m.div>
              ))}
            </>
          ) : (
            <div>Select a layer</div>
          )}
        </div>
      </div>

      {layerNode
        ? Object.values(layerNode).map((layer) => {
            return <Hierarchy {...{ layer }} />;
          })
        : null}
    </div>
  );
}

export default App;
