import React from 'react';

import { m } from 'motioned';

import type { LayerNode } from '../plugin/utils';

type PluginMessage = {
  type: 'onSelectionChange';
  message: {
    layerNode: LayerNode;
  };
};

export const MinusIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
};

export const PlayIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
      />
    </svg>
  );
};

export const CheckIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
};

export const ArrowPath = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
};

type Animation = Record<string, { [x: string]: string }>;

export const NewSetting = ({
  setAnimations,
  layerId,
}: {
  setAnimations: React.Dispatch<React.SetStateAction<Animation>>;
  layerId: string;
}) => {
  const [name, setName] = React.useState('');
  const [value, setValue] = React.useState('');

  const [show, setShow] = React.useState(false);

  const addSetting = () => {
    setAnimations((prevState) => ({
      ...prevState,
      [layerId]: { ...prevState[layerId], [name]: value },
    }));

    setName('');
    setValue('');

    setShow(false);
  };

  return (
    <>
      <button onClick={() => setShow((prevState) => !prevState)}>+</button>
      {show ? (
        <div className="flex">
          {/* todo: make this a select element */}
          <input
            type="text"
            value={name}
            placeholder="Prop name..."
            onChange={(ev) => setName(ev.target.value)}
          />
          <input
            type="text"
            value={value}
            placeholder="Prop value..."
            onChange={(ev) => setValue(ev.target.value)}
          />
          <button
            className={`${
              !name || !value ? 'text-gray-400' : 'text-green-500'
            }`}
            onClick={() => addSetting()}
          >
            <CheckIcon />
          </button>
        </div>
      ) : null}
    </>
  );
};

function App() {
  const [currentLayerNode, setCurrentLayerNode] =
    React.useState<LayerNode>(null);
  const [prevLayerNodes, setPrevLayerNodes] = React.useState<LayerNode[]>([]);

  const [animations, setAnimations] = React.useState<Animation>({});

  const [isEnabled, setIsEnabled] = React.useState(false);

  React.useEffect(() => {
    window.onmessage = (event: { data: { pluginMessage: PluginMessage } }) => {
      const { type, message } = event.data.pluginMessage;
      if (type === 'onSelectionChange') {
        setCurrentLayerNode(message.layerNode);
      }
    };
  }, []);

  const goBack = () => {
    if (prevLayerNodes.length > 0) {
      setPrevLayerNodes((prevState) => {
        const layer = prevState.pop();

        setCurrentLayerNode(layer);
        return prevState;
      });
    }
  };

  const selectLayerNode = (layer: LayerNode) => {
    setPrevLayerNodes((prevState) => [...prevState, currentLayerNode]);
    setCurrentLayerNode(layer);
  };

  return (
    <div style={{ paddingTop: 4 }}>
      <div className="flex justify-center mb-4">
        <div>
          {currentLayerNode ? (
            <>
              {
                <m.div
                  key={currentLayerNode.id}
                  style={{
                    position: 'relative',
                    ...currentLayerNode.styles,
                    top: 0,
                    left: 0,
                  }}
                  animate={
                    isEnabled ? animations[currentLayerNode.id] ?? {} : {}
                  }
                >
                  {/* Layer children */}
                  {currentLayerNode.children?.map((child) => {
                    return (
                      <m.div
                        key={child.id}
                        style={child.styles}
                        // todo: without auto-layout we have to use absolute
                        // figure out how me make this work
                        // style={{ position: 'absolute', ...child.styles }}
                        animate={isEnabled ? animations[child.id] ?? {} : {}}
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

      {currentLayerNode ? (
        <div className="m-2 rounded-md p-4 border border-gray-200 bg-gray-50">
          <div className="flex justify-between mb-2">
            <div className="flex gap-4 items-center">
              <button onClick={() => setIsEnabled((prevState) => !prevState)}>
                {isEnabled ? <ArrowPath /> : <PlayIcon />}
              </button>

              <div className="h-4 border-r border-gray-400" />

              <button onClick={() => goBack()}>
                {prevLayerNodes[prevLayerNodes.length - 1]?.name ??
                  currentLayerNode.name}
              </button>
              {prevLayerNodes.length > 0 ? (
                <>
                  <span>{'>'}</span>
                  <button>{currentLayerNode.name}</button>
                </>
              ) : null}
            </div>
            <div>Export</div>
          </div>

          <div className="flex gap-4">
            <div className="rounded-md">
              {currentLayerNode.children?.map((layer) => (
                <button
                  key={layer.id}
                  className="p-2"
                  onClick={() => selectLayerNode(layer)}
                >
                  {layer.name}
                </button>
              ))}
            </div>

            <div className="rounded-md p-2 flex-1 bg-white shadow-sm space-y-2">
              <NewSetting
                {...{ setAnimations }}
                layerId={currentLayerNode.id}
              />
              {Object.entries(animations[currentLayerNode.id] ?? {}).map(
                ([key, name]) => (
                  <div
                    key={currentLayerNode.id + key}
                    className="flex justify-between"
                  >
                    <div>{key}</div>
                    <input type="text" value={name} />
                    <button>
                      <MinusIcon />
                    </button>
                  </div>
                ),
              )}
              <hr />

              <div className="flex">
                <div>Easing:</div>
                <select>
                  <option>Ease in out</option>
                  <option>Ease in</option>
                  <option>Linear</option>
                </select>
              </div>
              <div>Duration:</div>
              <input placeholder="300ms" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
