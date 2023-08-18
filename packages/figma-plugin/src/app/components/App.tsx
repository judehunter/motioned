import React from 'react';
import '../styles/ui.css';

import { m } from 'motioned';

import type { FigmaNodeTypesWithProps } from '../../plugin/utils';

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

function App() {
  // in each component check if they have a variant
  const [selectedComp, setSelectedComp] = React.useState<PluginMessage['message']>(null);
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
          {Object.entries(selectedComp.componentNode).map(([_, component]) => (
            <div key={component.id} style={{ position: 'relative', ...component.styles }}>
              {component.children.map((child) => {
                const [[name, opts]] = Object.entries(child);
                const Comp = FIGMA_NODE_TO_REACT[opts.figmaNodeType];

                const variantProp = selectedComp.variantsPerNode[name];

                return (
                  <Comp
                    {...(variantProp
                      ? {
                          variants: variantProp,
                          animate: currentVariant,
                        }
                      : {})}
                    key={opts.id}
                    // todo before review: update this for auto-layouts
                    style={{ position: 'absolute', ...opts.styles }}
                  />
                );
              })}
            </div>
          ))}

          <div style={{ marginTop: 40 }}>
            {selectedComp.variantsList.map((v) => (
              <button
                key={v}
                onClick={() => setCurrentVariant(v)}
                style={currentVariant === v ? { backgroundColor: '#000', color: 'white' } : {}}
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
