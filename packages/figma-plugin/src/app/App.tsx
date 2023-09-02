import { useEffect, useMemo, useRef, useState } from 'react';

import { AnimateOptions, m } from 'motioned';

import { LayerNode, useWatch } from '../plugin/utils';
import {
  DndContext,
  MouseSensor,
  useDraggable,
  useSensor,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  createSnapModifier,
  restrictToHorizontalAxis,
} from '@dnd-kit/modifiers';
import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  offset,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { BezierCurveEditor } from 'react-bezier-curve-editor';

type PluginMessage = {
  type: 'onSelectionChange';
  message: {
    layerNode: LayerNode | null;
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

const Keyframe = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  const {
    refs,
    floatingStyles,
    context,
    placement: resultantPlacement,
  } = useFloating({
    placement: 'top',
    open,
    onOpenChange: setOpen,
    middleware: [offset(4)],
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context),
  ]);

  return (
    <>
      <div
        className="transform rotate-45 -translate-x-1/2 bg-teal-600 w-[15px] h-[15px] border-2 border-gray-50"
        ref={refs.setReference}
        {...getReferenceProps()}
      />
      <FloatingPortal>
        {open ? (
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              {...getFloatingProps()}
              className="z-[1] bg-white rounded-lg shadow p-2"
              style={floatingStyles}
            >
              <input
                type="text"
                className="outline-none rounded-lg"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            </div>
          </FloatingFocusManager>
        ) : null}
      </FloatingPortal>
    </>
  );
};

const easingBezierMap = {
  linear: [0.5, 0.5, 0.5, 0.5],
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'circ-in': [0.55, 0, 1, 0.45],
  'circ-out': [0, 0.55, 0.45, 1],
  'circ-in-out': [0.85, 0, 0.15, 1],
  'back-in': [0.36, 0, 0.66, -0.56],
  'back-out': [0.34, 1.56, 0.64, 1],
  'back-in-out': [0.68, -0.6, 0.32, 1.6],
};

const TransitionLine = ({
  property,
  dragDeltaKeyframe,
  dragDeltaDelay,
  onChange,
}: {
  property: Property;
  dragDeltaKeyframe: number;
  dragDeltaDelay: number;
  onChange: (property: Property) => void;
}) => {
  const [open, setOpen] = useState(false);

  const {
    refs,
    floatingStyles,
    context,
    placement: resultantPlacement,
  } = useFloating({
    placement: 'top',
    open,
    onOpenChange: setOpen,
    middleware: [offset(4)],
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context),
  ]);

  const [bezierValues, setBezierValues] = useState(
    Array.isArray(property.easing)
      ? property.easing
      : easingBezierMap[property.easing],
  );

  return (
    <>
      <div
        className="absolute top-1/2 transform -translate-y-1/2 flex items-center h-[10px] cursor-pointer"
        style={{
          width:
            property.duration * ZOOM -
            property.delay * ZOOM +
            dragDeltaKeyframe -
            dragDeltaDelay,
          left: property.delay * ZOOM + paddingLeft + dragDeltaDelay,
        }}
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <div className="h-[3px] w-full bg-teal-500" />
      </div>
      <FloatingPortal>
        {open ? (
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              {...getFloatingProps()}
              className="z-[1] bg-white rounded-lg shadow p-2"
              style={floatingStyles}
            >
              <select
                value={
                  Array.isArray(property.easing) ? 'custom' : property.easing
                }
                onChange={({ target: { value } }) => {
                  if (value !== 'custom') {
                    onChange({ ...property, easing: value });
                    setBezierValues(easingBezierMap[value]);
                  } else {
                    onChange({ ...property, easing: bezierValues });
                  }
                }}
                className="w-full bg-transparent outline-none px-0"
              >
                <option value="custom">custom</option>
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
              <div className="overflow-hidden">
                <BezierCurveEditor
                  size={150}
                  outerAreaColor="transparent"
                  outerAreaSize={0}
                  value={bezierValues}
                  onChange={(value) => {
                    setBezierValues(value);
                    onChange({ ...property, easing: value });
                  }}
                />
              </div>
            </div>
          </FloatingFocusManager>
        ) : null}
      </FloatingPortal>
    </>
  );
};

const DelayPseudoKeyframe = () => {
  return (
    <div className="transform rotate-45 -translate-x-1/2 bg-teal-600 w-[10px] h-[10px] border-2 border-gray-50"></div>
  );
};

const ArrowDownRight = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m13 11l5 5m0 0l-5 5m5-5h-7.803c-1.118 0-1.678 0-2.105-.218a2 2 0 0 1-.874-.874C7 14.48 7 13.92 7 12.8V3"
      />
    </svg>
  );
};

const ZOOM = 0.5;
type Property = {
  name: string;
  value: string;
  easing: string | [number, number, number, number];
  duration: number;
  delay: number;
};
const AnimProperty = ({
  property,
  onChange,
  onClick,
}: {
  property: Property;
  onChange: (property: Property) => void;
  onClick: (property: Property) => void;
}) => {
  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      delay: 100,
      tolerance: 10,
    },
  });
  return (
    <>
      <button
        className="sticky left-0 py-1 z-[1] flex items-center gap-x-2 text-slate-800 outline-none"
        onClick={() => onClick(property)}
      >
        <div className="mt-[-5px]">
          <ArrowDownRight />
        </div>
        <span>{property.name}</span>
      </button>

      <DndContext
        modifiers={[restrictToHorizontalAxis, createSnapModifier(5)]}
        onDragEnd={(e) => {
          if (e.active.id === 'keyframe') {
            onChange({
              ...property,
              duration: property.duration + e.delta.x / ZOOM,
            });
          } else if (e.active.id === 'delay') {
            onChange({
              ...property,
              delay: property.delay + e.delta.x / ZOOM,
            });
          }
        }}
        sensors={[mouseSensor]}
      >
        <AnimPropertyKeyframes property={property} onChange={onChange} />
      </DndContext>
    </>
  );
};

const paddingLeft = 15;
const AnimPropertyKeyframes = ({
  property,
  onChange,
}: {
  property: Property;
  onChange: (property: Property) => void;
}) => {
  const keyframeDraggable = useDraggable({
    id: 'keyframe',
  });
  const delayDraggable = useDraggable({
    id: 'delay',
  });

  return (
    <div className="pr-[150px] py-1 relative z-[-1]">
      <TransitionLine
        property={property}
        dragDeltaKeyframe={keyframeDraggable.transform?.x ?? 0}
        dragDeltaDelay={delayDraggable.transform?.x ?? 0}
        onChange={(property) => onChange(property)}
      />
      <div
        className="absolute top-1/2 transform -translate-y-1/2"
        style={{ left: property.duration * ZOOM + paddingLeft }}
      >
        <div
          ref={keyframeDraggable.setNodeRef}
          {...keyframeDraggable.listeners}
          {...keyframeDraggable.attributes}
          style={{
            transform: CSS.Translate.toString(keyframeDraggable.transform),
          }}
        >
          <Keyframe
            value={property.value}
            onChange={(value) => onChange({ ...property, value })}
          />
        </div>
      </div>
      <div
        className="absolute top-1/2 transform -translate-y-1/2"
        style={{ left: property.delay * ZOOM + paddingLeft }}
      >
        <div
          ref={delayDraggable.setNodeRef}
          {...delayDraggable.listeners}
          {...delayDraggable.attributes}
          style={{
            transform: CSS.Translate.toString(delayDraggable.transform),
          }}
        >
          <DelayPseudoKeyframe />
        </div>
      </div>
    </div>
  );
};

const TimelineTick = ({ size }: { size: 1 | 2 | 3 }) => {
  return (
    <div
      className={`border-r border-r-slate-300`}
      style={{
        height: {
          1: '2px',
          2: '5px',
          3: '10px',
        }[size],
      }}
    />
  );
};

const Timeline = ({}) => {
  const count = 10 * 10 + 1;
  return (
    <div>
      <div className="border-b border-b-slate-300" />
      <div className="flex items-start" style={{ gap: 10 * ZOOM - 1 }}>
        {[...new Array(count)].map((_, idx) => (
          <TimelineTick
            key={idx}
            size={idx % 100 === 0 ? 3 : idx % 10 === 0 ? 2 : 1}
          />
        ))}
      </div>
    </div>
  );
};

const LayerNodeSettings = ({
  layerNode,
  animateOptions,
  onChangeAnimateOptions,
}: // labelsTarget,
// timelineTarget,
{
  layerNode: LayerNode;
  animateOptions: AnimateOptions;
  onChangeAnimateOptions: (animateOptions: AnimateOptions) => void;
  // labelsTarget: React.MutableRefObject<HTMLDivElement | null>;
  // timelineTarget: React.MutableRefObject<HTMLDivElement | null>;
}) => {
  const { transition, animateProperties } = useMemo(() => {
    const { transition = {}, ...animateProperties } = animateOptions;
    return { transition, animateProperties };
  }, [animateOptions]);

  const [properties, setProperties] = useState<Property[] | undefined>(
    undefined,
  );

  useWatch(animateOptions, () => {
    const newProperties = Object.entries(animateProperties).map(
      ([name, value]) => ({ name, value, ...transition[name] }),
    );
    setProperties(newProperties);
  });

  const save = () => {
    const newProperties = Object.fromEntries(
      properties!.map(({ name, value }) => [name, value]),
    );
    const newTransitions = Object.fromEntries(
      properties!.map(({ name, easing, duration, delay }) => [
        name,
        { easing, duration, delay },
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

  const [newPropertyName, setNewPropertyName] = useState('');

  const updateProperty = (idx: number, property: Property) => {
    const newProperties = [...properties!];
    newProperties[idx] = property;
    setProperties(newProperties);
  };

  useEffect(() => {
    window.addEventListener('keypress', function (event) {
      if (event.key === '=') {
        event.preventDefault();
        saveRef.current();
      }
    });
  }, []);

  if (!properties) return null;

  return (
    <div className="grid grid-cols-[150px_auto] mr-[-150px] relative z-[1]">
      <div className="font-medium sticky left-0 bg-slate-100 rounded-lg px-2 py-1 mt-5 mb-1 z-[1]">
        {layerNode.name}
      </div>
      <div className="pr-[150px] py-1 pt-7 pl-[15px] mb-1">
        <Timeline />
      </div>

      {properties.map(({ value, duration, easing, name, delay }, idx) => (
        <AnimProperty
          key={idx}
          property={{
            name,
            value: '' + value,
            easing,
            duration,
            delay,
          }}
          onChange={(x) => updateProperty(idx, x)}
          onClick={(p) => {
            setProperties((prevState) => {
              return prevState?.filter((x) => x.name !== p.name);
            });
          }}
        />
      ))}

      <div className="font-medium sticky left-0 py-1 z-[1]">
        <form
          className="m-0"
          onSubmit={(e) => {
            e.preventDefault();
            setProperties([
              ...properties,
              {
                name: newPropertyName,
                value: '',
                duration: 300,
                easing: 'ease',
                delay: 0,
              },
            ]);
            setNewPropertyName('');
          }}
        >
          <input
            className="w-full bg-transparent outline-none font-normal"
            type="text"
            value={newPropertyName}
            placeholder="+ New property"
            onChange={(e) => setNewPropertyName(e.target.value)}
          />
        </form>
      </div>

      <div className="pr-[150px] py-1"></div>

      {/* <button
        onClick={() => {
          setProperties([
            ...properties,
            { name: '', value: '', duration: 300, easing: 'ease' },
          ]);
        }}
      >
        <span className="text-slate-500">+ new property</span>
      </button> */}
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

const App = () => {
  const [currentLayerNode, setCurrentLayerNode] = useState<LayerNode | null>(
    null,
  );

  const treeList = useMemo(
    () => (currentLayerNode ? walkNodeTree(currentLayerNode) : []),
    [currentLayerNode?.id],
  );

  useEffect(() => {
    window.onmessage = (event: { data: { pluginMessage: PluginMessage } }) => {
      const { type, message } = { ...event.data.pluginMessage };
      if (type === 'onSelectionChange') {
        setCurrentLayerNode(
          message.layerNode ? { ...message.layerNode } : null,
        );
      }
    };
  }, []);

  return (
    <div>
      {currentLayerNode ? (
        <div>
          {/* {currentLayerNode.name} {JSON.stringify(treeList)} */}
          <FrameSettings layerNode={currentLayerNode} treeList={treeList} />
        </div>
      ) : (
        <div className="text-center mt-4">Select a Frame element.</div>
      )}
    </div>
  );
};

const useVariants = (treeList: LayerNode[]) => {
  const [layerVariants, setLayerVariants] = useState<
    Record<string, Record<string, AnimateOptions>>
  >(Object.fromEntries(treeList.map((x) => [x.id, { initial: {} }])));

  const [definedVariants, setDefinedVariants] = useState<string[]>(['initial']);

  const addVariant = (variant: string) => {
    if (definedVariants.includes(variant)) return;
    setDefinedVariants((prevState) => {
      const newDefinedVariants = [...prevState, variant];

      setLayerVariants((layerPrevState) => {
        const newState = { ...layerPrevState };

        for (const layerId in newState) {
          for (const variant of newDefinedVariants) {
            if (!newState[layerId][variant]) {
              newState[layerId][variant] = {};
            }
          }
        }
        return newState;
      });

      return newDefinedVariants;
    });
  };

  const removeVariant = (variant: string) => {
    if (!definedVariants.includes(variant)) return;
    setDefinedVariants((prevState) => {
      const newDefinedVariants = prevState.filter((x) => x !== variant);

      setLayerVariants((prevState) => {
        const newState = { ...prevState };

        for (const layerId in newState) {
          for (const variant in newState[layerId]) {
            if (!newDefinedVariants.includes(variant)) {
              delete newState[layerId][variant];
            }
          }
        }
        return newState;
      });

      return newDefinedVariants;
    });
  };

  const renameVariant = (oldVariant: string, newVariant: string) => {
    if (!definedVariants.includes(oldVariant)) return;
    setDefinedVariants((prevState) =>
      prevState.map((x) => (x === oldVariant ? newVariant : x)),
    );

    setLayerVariants((prevState) => {
      const newState = { ...prevState };

      for (const layerId in newState) {
        for (const variant in newState[layerId]) {
          if (variant === oldVariant) {
            newState[layerId][newVariant] = newState[layerId][variant];
            delete newState[layerId][variant];
          }
        }
      }
      return newState;
    });
  };

  return {
    definedVariants,
    layerVariants,
    setLayerVariants,
    addVariant,
    removeVariant,
    renameVariant,
  };
};

const RenderLayerNode = ({
  layerNode,
  layerVariants,
  selectedVariant,
}: {
  layerNode: LayerNode;
  layerVariants: Record<string, Record<string, AnimateOptions>>;
  selectedVariant: string;
}) => {
  const renderChildren = () => {
    return layerNode.children?.map((child) => {
      return (
        <RenderLayerNode
          key={child.id}
          layerNode={child}
          layerVariants={layerVariants}
          selectedVariant={selectedVariant}
        />
      );
    });
  };
  if (layerNode.type === 'GROUP') {
    return <>{renderChildren()}</>;
  }

  return (
    <m.div
      key={layerNode.id}
      attr-name={layerNode.name}
      style={{
        ...layerNode.styles,
        ...(layerNode.type === 'FRAME'
          ? { position: 'relative', top: 0, left: 0 }
          : { position: 'absolute' }),
        ...(layerNode.styles.__rotate
          ? {
              '--rotate-z': layerNode.styles.__rotate,
            }
          : {}),
      }}
      animate={layerVariants[layerNode.id][selectedVariant]}
    >
      {/* Layer children */}
      {renderChildren()}
    </m.div>
  );
};

const VariantActions = ({
  onAdd,
  onRemove,
  onRename,
  selectedVariant,
  hideRemove,
}: {
  onAdd: (name: string) => void;
  onRemove: () => void;
  onRename: (name: string) => void;
  hideRemove?: boolean;
  selectedVariant: string;
}) => {
  const [openState, setOpenState] = useState<
    'add' | 'remove' | 'rename' | undefined
  >();
  const [name, setName] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const onVariantChange = (action: 'add' | 'rename') => {
    if (action === 'add') onAdd(name);
    else onRename(name);

    setName('');
    setOpenState(undefined);
  };

  const btns = [
    ...(!hideRemove
      ? [
          {
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="#0a0606"
                viewBox="0 0 256 256"
              >
                <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
              </svg>
            ),
            onClick: () =>
              setOpenState((prevState) =>
                prevState === 'remove' ? undefined : 'remove',
              ),
            state: 'remove',
          },
        ]
      : []),
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="#0a0606"
          viewBox="0 0 256 256"
        >
          <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
        </svg>
      ),
      onClick: () => {
        setOpenState((prevState) => (prevState === 'add' ? undefined : 'add'));
      },
      state: 'add',
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="#0a0606"
          viewBox="0 0 256 256"
        >
          <path d="M227.32,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31l83.67-83.66,3.48,13.9-36.8,36.79a8,8,0,0,0,11.31,11.32l40-40a8,8,0,0,0,2.11-7.6l-6.9-27.61L227.32,96A16,16,0,0,0,227.32,73.37ZM48,179.31,76.69,208H48Zm48,25.38L51.31,160,136,75.31,180.69,120Zm96-96L147.32,64l24-24L216,84.69Z"></path>
        </svg>
      ),
      onClick: () => {
        setOpenState((prevState) => {
          const newState = prevState === 'rename' ? undefined : 'rename';

          if (newState) setName(selectedVariant);
          else setName('');

          return newState;
        });
      },
      state: 'rename',
    },
  ];

  return (
    <div className="flex">
      {btns.map((b) =>
        openState !== undefined && b.state !== openState ? null : (
          <button
            onClick={() => {
              b.onClick();
            }}
            className="rounded-md shadow-sm p-1 border border-gray-100 mr-2"
          >
            {openState === b.state ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
              </svg>
            ) : (
              b.icon
            )}
          </button>
        ),
      )}
      {openState === 'remove' ? (
        <button
          className="text-red-800 outline-none"
          onClick={() => {
            onRemove();
            setOpenState(undefined);
          }}
        >
          Confirm
        </button>
      ) : null}
      {openState === 'add' || openState === 'rename' ? (
        <>
          <button
            className={`rounded-md shadow-sm p-1 border ${
              !!name && name !== selectedVariant
                ? 'border-green-500'
                : 'border-gray-100'
            } mr-4 transition-all`}
            disabled={!name || name === selectedVariant}
            onClick={() => onVariantChange(openState)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="#0a0606"
              viewBox="0 0 256 256"
            >
              <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
            </svg>
          </button>
          <input
            ref={inputRef}
            className="outline-none"
            placeholder="variant name..."
            value={name}
            onChange={(ev) => setName(ev.target.value)}
          />
        </>
      ) : null}
    </div>
  );
};

const FrameSettings = ({
  layerNode,
  treeList,
}: {
  layerNode: LayerNode<FrameNode>;
  treeList: LayerNode[];
}) => {
  const {
    definedVariants,
    layerVariants,
    setLayerVariants,
    addVariant,
    removeVariant,
    renameVariant,
  } = useVariants(treeList);
  const [selectedVariant, setSelectedVariant] = useState<string>('initial');

  return (
    <div>
      <div className="flex justify-center mt-4 mb-5">
        <div>
          <RenderLayerNode
            layerNode={layerNode}
            layerVariants={layerVariants}
            selectedVariant={selectedVariant}
          />
        </div>
      </div>
      <div className="m-2 p-4 border-t border-slate-200">
        <div className="flex justify-between mb-2">
          <div className="flex gap-4 items-center">
            <select
              className="focus:outline-none bg-transparent px-0"
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
            >
              {definedVariants.map((variant) => (
                <option key={variant} value={variant}>
                  {variant}
                </option>
              ))}
            </select>

            <VariantActions
              onRemove={() => {
                removeVariant(selectedVariant);
                setSelectedVariant(
                  definedVariants.find((x) => x !== selectedVariant) ??
                    'initial',
                );
              }}
              onAdd={(name) => {
                addVariant(name);
                setSelectedVariant(name);
              }}
              onRename={(name) => {
                renameVariant(selectedVariant, name);
                setSelectedVariant(name);
              }}
              hideRemove={definedVariants.length === 1}
              {...{ selectedVariant }}
            />
          </div>
          <div>Export</div>
        </div>
        {/* overflow-x-auto */}
        <div className="overflow-x-hidden pb-8">
          {treeList.slice(1 /* do not show the frame */).map((layerNode) => (
            <LayerNodeSettings
              key={layerNode.id}
              layerNode={layerNode}
              animateOptions={layerVariants[layerNode.id][selectedVariant]}
              onChangeAnimateOptions={(animateOptions) => {
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
    </div>
  );
};

export default App;
