import React from 'react';

import { m } from 'motioned';

import type { FigmaNodeTypesWithProps } from '../plugin/utils';

type PluginMessage = {
  type: 'onSelectionChange';
  message: {
    componentNode: FigmaNodeTypesWithProps;
    variantsPerNode: Record<string, any>;
    variantsList: string[];
  };
};

const FIGMA_NODE_TO_REACT = {
  FRAME: m.div,
  COMPONENT: React.Fragment,
};

const ChildLayer = ({
  child,
  variantsPerNode,
  currentVariant,
}: {
  child: FigmaNodeTypesWithProps;
  variantsPerNode: PluginMessage['message']['variantsPerNode'];
  currentVariant: string;
}) => {
  const [[name, opts]] = Object.entries(child);
  const Comp = FIGMA_NODE_TO_REACT[opts.figmaNodeType];

  const variants = variantsPerNode[name];

  return (
    <Comp
      {...(variants
        ? {
            variants,
            animate: currentVariant,
          }
        : {})}
      key={opts.id}
      style={{ position: 'absolute', ...opts.styles }}
    />
  );
};

function App() {
  const [selectedComp, setSelectedComp] =
    React.useState<PluginMessage['message']>(null);
  const [currentVariant, setCurrentVariant] = React.useState('');

  React.useEffect(() => {
    window.onmessage = (event: { data: { pluginMessage: PluginMessage } }) => {
      const { type, message } = event.data.pluginMessage;
      if (type === 'onSelectionChange') {
        setSelectedComp(message);
        setCurrentVariant(message.variantsList[0]);
      }
    };
  }, []);

  return (
    <div style={{ paddingTop: 4 }}>
      {selectedComp ? (
        <>
          {Object.entries(selectedComp.componentNode).map(([_, component]) => {
            const variants = selectedComp.variantsPerNode['COMPONENT_ROOT'];

            const Comp = variants ? m.div : 'div';

            return (
              <Comp
                key={component.id}
                style={{ position: 'relative', ...component.styles }}
                {...(variants
                  ? {
                      variants,
                      animate: currentVariant,
                    }
                  : {})}
              >
                {/* Component children */}
                {component.children.map((child) => (
                  <ChildLayer
                    {...{ child, currentVariant }}
                    variantsPerNode={selectedComp.variantsPerNode}
                  />
                ))}
              </Comp>
            );
          })}

          <div style={{ marginTop: 40 }}>
            {selectedComp.variantsList.map((v) => (
              <button
                key={v}
                onClick={() => setCurrentVariant(v)}
                style={
                  currentVariant === v
                    ? { backgroundColor: '#000', color: 'white' }
                    : {}
                }
              >
                {v}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default App;
