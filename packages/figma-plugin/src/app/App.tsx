import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AnimateOptions, m } from 'motioned';

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

// export const NewSetting = ({
//   setAnimations,
//   layerId,
// }: {
//   setAnimations: React.Dispatch<React.SetStateAction<Animation>>;
//   layerId: string;
// }) => {
//   const [name, setName] = useState('');
//   const [value, setValue] = useState('');

//   const [show, setShow] = useState(false);

//   const addSetting = () => {
//     setAnimations((prevState) => ({
//       ...prevState,
//       [layerId]: { ...prevState[layerId], [name]: value },
//     }));

//     setName('');
//     setValue('');

//     setShow(false);
//   };

//   return (
//     <>
//       <button onClick={() => setShow((prevState) => !prevState)}>+</button>
//       {show ? (
//         <div className="flex">
//           {/* todo: make this a select element */}
//           <input
//             type="text"
//             value={name}
//             placeholder="Prop name..."
//             onChange={(ev) => setName(ev.target.value)}
//           />
//           <input
//             type="text"
//             value={value}
//             placeholder="Prop value..."
//             onChange={(ev) => setValue(ev.target.value)}
//           />
//           <button
//             className={`${
//               !name || !value ? 'text-gray-400' : 'text-green-500'
//             }`}
//             onClick={() => addSetting()}
//           >
//             <CheckIcon />
//           </button>
//         </div>
//       ) : null}
//     </>
//   );
// };
type Property = {
  name: string;
  value: string;
  easing: string;
  duration: number;
};
const AnimProperty = ({
  property,
  onChange,
}: {
  property: Property;
  onChange: (property: Property) => void;
}) => {
  return (
    <div className="flex items-center mb-2 gap-3">
      <input
        value={property.name}
        onChange={(e) => onChange({ ...property, name: e.target.value })}
        className="border-b-2 border-gray-400 bg-transparent outline-none w-[100px]"
        placeholder="name"
      />
      <div>:</div>
      <input
        value={property.value}
        onChange={(e) => onChange({ ...property, value: e.target.value })}
        className="border-b-2 border-gray-400 bg-transparent outline-none w-[100px]"
        placeholder="value"
      />
      <div className="flex items-center">
        <input
          value={property.duration}
          type="number"
          onChange={(e) =>
            onChange({ ...property, duration: e.target.valueAsNumber })
          }
          className="border-b-2 border-gray-400 bg-transparent outline-none text-right w-[50px]"
          placeholder="duration"
        />
        <span className="ml-1">ms</span>
      </div>
      <select
        value={property.easing}
        onChange={(e) => onChange({ ...property, easing: e.target.value })}
        className="border-b-2 border-gray-400 bg-transparent outline-none w-[140px]"
      >
        <option value="ease">ease</option>
        <option value="ease-in">ease-in</option>
        <option value="ease-out">ease-out</option>
        <option value="ease-in-out">ease-in-out</option>
        <option value="ease-in-out">ease-in-out</option>
        <option value="circ-in">circ-in</option>
        <option value="circ-out">circ-out</option>
        <option value="circ-in-out">circ-in-out</option>
        <option value="back-in">back-in</option>
        <option value="back-out">back-out</option>
        <option value="back-in-out">back-in-out</option>
        <option value="linear">linear</option>
      </select>
    </div>
  );
};

const LayerNodeSettings = ({
  layerNode,
  animateOptions,
  onChangeAnimateOptions,
}: {
  layerNode: LayerNode;
  animateOptions: AnimateOptions;
  onChangeAnimateOptions: (animateOptions: AnimateOptions) => void;
}) => {
  const { transition = {}, ...animateProperties } = animateOptions;

  const [properties, setProperties] = useState<Property[]>(undefined);

  useEffect(() => {
    const newProperties = Object.entries(animateProperties).map(
      ([name, value]) => ({ name, value, ...transition[name] }),
    );
    setProperties(newProperties);
  }, [animateOptions]);

  const save = () => {
    const newProperties = Object.fromEntries(
      properties.map(({ name, value }) => [name, value]),
    );
    const newTransitions = Object.fromEntries(
      properties.map(({ name, easing, duration }) => [
        name,
        { easing, duration },
      ]),
    );
    onChangeAnimateOptions({
      ...animateOptions,
      ...newProperties,
      transition: { ...transition, ...newTransitions },
    });
  };
  const saveRef = useRef(save);
  saveRef.current = save;

  // console.log({ properties });

  const updateProperty = (idx: number, property: Property) => {
    const newProperties = [...properties];
    newProperties[idx] = property;
    setProperties(newProperties);
  };

  useEffect(() => {
    window.addEventListener('keypress', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        saveRef.current();
      }
    });
  }, []);

  if (!properties) return null;

  return (
    <div className="my-5">
      <div className="font-medium">{layerNode.name}</div>

      {properties.map(({ value, duration, easing, name }, idx) => (
        <AnimProperty
          key={idx}
          property={{
            name,
            value: '' + value,
            easing,
            duration,
          }}
          onChange={(x) => updateProperty(idx, x)}
        />
      ))}
      <button
        onClick={() => {
          setProperties([
            ...properties,
            { name: '', value: '', duration: 300, easing: 'ease' },
          ]);
        }}
      >
        <span className="text-slate-500">+ new property</span>
      </button>
    </div>
  );
};

const walkNodeTree = (node: LayerNode) => {
  if (!node) return [];
  const nodes = [node];
  if (node.children) {
    for (const child of node.children) {
      nodes.push(...walkNodeTree(child));
    }
  }
  return nodes;
};

function App() {
  const [currentLayerNode, setCurrentLayerNode] = useState<LayerNode>(null);

  const treeList = useMemo(
    () => walkNodeTree(currentLayerNode),
    [currentLayerNode],
  );

  const [selectedVariant, setSelectedVariant] = useState<string | null>('off');
  const [layerVariants, setLayerVariants] =
    useState<Record<string, Record<string, AnimateOptions>>>(undefined);

  const [isEnabled, setIsEnabled] = useState(false);

  const allVariants =
    layerVariants && Object.values(layerVariants).length
      ? Object.keys(Object.values(layerVariants)[0])
      : [];

  useEffect(() => {
    window.onmessage = (event: { data: { pluginMessage: PluginMessage } }) => {
      const { type, message } = { ...event.data.pluginMessage };
      if (type === 'onSelectionChange') {
        setCurrentLayerNode({ ...message.layerNode });
      }
    };
  }, []);

  useEffect(() => {
    if (treeList.length) {
      setLayerVariants(
        Object.fromEntries(treeList.map((x) => [x.id, { off: {}, on: {} }])),
      );
    }
  }, [treeList]);

  // console.log(layerVariants);

  if (!currentLayerNode || !treeList.length || !layerVariants) {
    return null;
  }
  console.log(layerVariants['120:8']);
  return (
    <div>
      <div className="flex justify-center mt-4 mb-5">
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
                  // animate={
                  //   isEnabled ? animateOptions[currentLayerNode.id] ?? {} : {}
                  // }
                  animate={layerVariants[currentLayerNode.id][selectedVariant]}
                  // animate={{}}
                >
                  {/* Layer children */}
                  {currentLayerNode.children?.map((child) => {
                    return (
                      <m.div
                        key={child.id}
                        // style={child.styles}
                        // todo: without auto-layout we have to use absolute
                        // figure out how me make this work
                        style={{ position: 'absolute', ...child.styles }}
                        // animate={
                        //   isEnabled ? animateOptions[child.id] ?? {} : {}
                        // }
                        animate={layerVariants[child.id][selectedVariant]}
                        // animate={{}}
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

              <select
                className="focus:outline-none bg-transparent"
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
              >
                {allVariants.map((variant) => (
                  <option key={variant} value={variant}>
                    {variant}
                  </option>
                ))}
              </select>
            </div>
            <div>Export</div>
          </div>

          <div>
            {treeList.map((layerNode) => (
              <LayerNodeSettings
                key={layerNode.id}
                layerNode={layerNode}
                animateOptions={layerVariants[layerNode.id][selectedVariant]}
                onChangeAnimateOptions={(animateOptions) => {
                  // console.log(selectedVariant);
                  setLayerVariants((lv) => ({
                    ...lv,
                    [layerNode.id]: {
                      ...lv[layerNode.id],
                      [selectedVariant]: animateOptions,
                    },
                  }));
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
