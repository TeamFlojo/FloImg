import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { NodeDefinition } from "@teamflojo/floimg-studio-shared";
import { getGenerators, getTransforms, getTextProviders, getVisionProviders } from "../api/client";
import { useWorkflowStore } from "../stores/workflowStore";
import { UploadGallery } from "./UploadGallery";

export function NodePalette() {
  const setGenerators = useWorkflowStore((s) => s.setGenerators);
  const setTransforms = useWorkflowStore((s) => s.setTransforms);
  const setTextProviders = useWorkflowStore((s) => s.setTextProviders);
  const setVisionProviders = useWorkflowStore((s) => s.setVisionProviders);
  const generators = useWorkflowStore((s) => s.generators);
  const transforms = useWorkflowStore((s) => s.transforms);
  const textProviders = useWorkflowStore((s) => s.textProviders);
  const visionProviders = useWorkflowStore((s) => s.visionProviders);
  const addNode = useWorkflowStore((s) => s.addNode);
  const [showUploads, setShowUploads] = useState(false);

  // Fetch node definitions
  const { data: fetchedGenerators } = useQuery({
    queryKey: ["generators"],
    queryFn: getGenerators,
  });

  const { data: fetchedTransforms } = useQuery({
    queryKey: ["transforms"],
    queryFn: getTransforms,
  });

  const { data: fetchedTextProviders } = useQuery({
    queryKey: ["textProviders"],
    queryFn: getTextProviders,
  });

  const { data: fetchedVisionProviders } = useQuery({
    queryKey: ["visionProviders"],
    queryFn: getVisionProviders,
  });

  useEffect(() => {
    if (fetchedGenerators) setGenerators(fetchedGenerators);
  }, [fetchedGenerators, setGenerators]);

  useEffect(() => {
    if (fetchedTransforms) setTransforms(fetchedTransforms);
  }, [fetchedTransforms, setTransforms]);

  useEffect(() => {
    if (fetchedTextProviders) setTextProviders(fetchedTextProviders);
  }, [fetchedTextProviders, setTextProviders]);

  useEffect(() => {
    if (fetchedVisionProviders) setVisionProviders(fetchedVisionProviders);
  }, [fetchedVisionProviders, setVisionProviders]);

  const handleDragStart = (e: React.DragEvent, definition: NodeDefinition) => {
    e.dataTransfer.setData("application/json", JSON.stringify(definition));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDoubleClick = (definition: NodeDefinition) => {
    // Add node at center of canvas
    addNode(definition, { x: 250, y: 150 + Math.random() * 100 });
  };

  // Input node definition (special case - for uploaded images)
  const inputDefinition: NodeDefinition = {
    id: "input:upload",
    type: "input",
    name: "upload",
    label: "Upload Image",
    description: "Use an uploaded image",
    category: "Input",
    params: {
      type: "object",
      properties: {},
    },
  };

  // Save node definition (special case)
  const saveDefinition: NodeDefinition = {
    id: "save:filesystem",
    type: "save",
    name: "save",
    label: "Save",
    description: "Save image to file",
    category: "Output",
    params: {
      type: "object",
      properties: {
        destination: {
          type: "string",
          title: "Destination",
          default: "./output/image.png",
        },
        provider: {
          type: "string",
          default: "filesystem",
        },
      },
    },
  };

  // Flow control node definitions (iterative workflows)
  const fanOutDefinition: NodeDefinition = {
    id: "fanout:default",
    type: "fanout",
    name: "fanout",
    label: "Fan-Out",
    description: "Distribute to parallel branches",
    category: "Flow Control",
    params: {
      type: "object",
      properties: {
        mode: {
          type: "string",
          title: "Mode",
          description: "How to fan out",
          enum: ["array", "count"],
          default: "count",
        },
        count: {
          type: "number",
          title: "Count",
          description: "Number of parallel branches (count mode)",
          default: 3,
          minimum: 2,
          maximum: 10,
        },
        arrayProperty: {
          type: "string",
          title: "Array Property",
          description: "Property name to iterate over (array mode)",
        },
      },
    },
  };

  const collectDefinition: NodeDefinition = {
    id: "collect:default",
    type: "collect",
    name: "collect",
    label: "Collect",
    description: "Gather parallel outputs",
    category: "Flow Control",
    params: {
      type: "object",
      properties: {
        expectedInputs: {
          type: "number",
          title: "Expected Inputs",
          description: "Number of inputs to collect",
          default: 3,
          minimum: 2,
          maximum: 10,
        },
        waitMode: {
          type: "string",
          title: "Wait Mode",
          description: "When to output",
          enum: ["all", "available"],
          default: "all",
        },
      },
    },
  };

  const routerDefinition: NodeDefinition = {
    id: "router:default",
    type: "router",
    name: "router",
    label: "Router",
    description: "Route based on AI selection",
    category: "Flow Control",
    params: {
      type: "object",
      properties: {
        selectionProperty: {
          type: "string",
          title: "Selection Property",
          description: "JSON property with selection (e.g., 'winner')",
          default: "winner",
        },
        selectionType: {
          type: "string",
          title: "Selection Type",
          description: "How to interpret selection",
          enum: ["index", "value"],
          default: "index",
        },
        outputCount: {
          type: "number",
          title: "Output Count",
          description: "How many items to route",
          default: 1,
          minimum: 1,
          maximum: 5,
        },
        contextProperty: {
          type: "string",
          title: "Context Property",
          description: "Optional property to pass through (e.g., 'refinement')",
        },
      },
    },
  };

  // Group generators by category
  const generatorsByCategory = generators.reduce(
    (acc, g) => {
      const cat = g.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(g);
      return acc;
    },
    {} as Record<string, NodeDefinition[]>
  );

  // Group transforms by category
  const transformsByCategory = transforms.reduce(
    (acc, t) => {
      const cat = t.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(t);
      return acc;
    },
    {} as Record<string, NodeDefinition[]>
  );

  return (
    <div className="floimg-sidebar w-64 border-r border-gray-200 dark:border-zinc-700 overflow-y-auto">
      <div className="p-4">
        <h2 className="floimg-sidebar__header text-lg !normal-case !tracking-normal">Nodes</h2>

        {/* Input */}
        <div className="floimg-sidebar__section">
          <div className="flex items-center justify-between mb-2">
            <h3 className="floimg-sidebar__header !text-amber-600 dark:!text-amber-400 !mb-0">
              Input
            </h3>
            <button
              onClick={() => setShowUploads(!showUploads)}
              className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
            >
              {showUploads ? "Hide" : "Browse"} Uploads
            </button>
          </div>
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, inputDefinition)}
            onDoubleClick={() => handleDoubleClick(inputDefinition)}
            className="floimg-palette-item floimg-palette-item--amber"
          >
            <div className="floimg-palette-item__title">Upload Image</div>
            <div className="floimg-palette-item__desc">Start with your image</div>
          </div>
          {showUploads && (
            <div className="mt-2 border border-amber-200 dark:border-amber-700 rounded bg-white dark:bg-zinc-900 max-h-64 overflow-y-auto">
              <UploadGallery />
            </div>
          )}
        </div>

        {/* Generators */}
        <div className="floimg-sidebar__section">
          <h3 className="floimg-sidebar__header !text-blue-600 dark:!text-blue-400">Generators</h3>
          {Object.entries(generatorsByCategory).map(([category, nodes]) => (
            <div key={category} className="mb-3">
              <div className="floimg-sidebar__category">{category}</div>
              {nodes.map((def) => (
                <div
                  key={def.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, def)}
                  onDoubleClick={() => handleDoubleClick(def)}
                  className="floimg-palette-item floimg-palette-item--blue"
                >
                  <div className="floimg-palette-item__title">{def.label}</div>
                  {def.description && (
                    <div className="floimg-palette-item__desc">{def.description}</div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Transforms */}
        <div className="floimg-sidebar__section">
          <h3 className="floimg-sidebar__header !text-teal-600 dark:!text-teal-400">Transforms</h3>
          {Object.entries(transformsByCategory).map(([category, nodes]) => (
            <div key={category} className="mb-3">
              <div className="floimg-sidebar__category">{category}</div>
              {nodes.map((def) => (
                <div
                  key={def.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, def)}
                  onDoubleClick={() => handleDoubleClick(def)}
                  className="floimg-palette-item floimg-palette-item--teal"
                >
                  <div className="floimg-palette-item__title">{def.label}</div>
                  {def.description && (
                    <div className="floimg-palette-item__desc">{def.description}</div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* AI Text */}
        {textProviders.length > 0 && (
          <div className="floimg-sidebar__section">
            <h3 className="floimg-sidebar__header !text-pink-600 dark:!text-pink-400">AI Text</h3>
            {textProviders.map((def) => (
              <div
                key={def.id}
                draggable
                onDragStart={(e) => handleDragStart(e, def)}
                onDoubleClick={() => handleDoubleClick(def)}
                className="floimg-palette-item floimg-palette-item--pink"
              >
                <div className="floimg-palette-item__title">{def.label}</div>
                {def.description && (
                  <div className="floimg-palette-item__desc">{def.description}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* AI Vision */}
        {visionProviders.length > 0 && (
          <div className="floimg-sidebar__section">
            <h3 className="floimg-sidebar__header !text-cyan-600 dark:!text-cyan-400">AI Vision</h3>
            {visionProviders.map((def) => (
              <div
                key={def.id}
                draggable
                onDragStart={(e) => handleDragStart(e, def)}
                onDoubleClick={() => handleDoubleClick(def)}
                className="floimg-palette-item floimg-palette-item--cyan"
              >
                <div className="floimg-palette-item__title">{def.label}</div>
                {def.description && (
                  <div className="floimg-palette-item__desc">{def.description}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Flow Control */}
        <div className="floimg-sidebar__section">
          <h3 className="floimg-sidebar__header !text-orange-600 dark:!text-orange-400">
            Flow Control
          </h3>
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, fanOutDefinition)}
            onDoubleClick={() => handleDoubleClick(fanOutDefinition)}
            className="floimg-palette-item floimg-palette-item--orange"
          >
            <div className="floimg-palette-item__title">Fan-Out</div>
            <div className="floimg-palette-item__desc">Distribute to parallel branches</div>
          </div>
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, collectDefinition)}
            onDoubleClick={() => handleDoubleClick(collectDefinition)}
            className="floimg-palette-item floimg-palette-item--orange"
          >
            <div className="floimg-palette-item__title">Collect</div>
            <div className="floimg-palette-item__desc">Gather parallel outputs</div>
          </div>
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, routerDefinition)}
            onDoubleClick={() => handleDoubleClick(routerDefinition)}
            className="floimg-palette-item floimg-palette-item--amber"
          >
            <div className="floimg-palette-item__title">Router</div>
            <div className="floimg-palette-item__desc">Route based on AI selection</div>
          </div>
        </div>

        {/* Output */}
        <div className="floimg-sidebar__section">
          <h3 className="floimg-sidebar__header !text-emerald-600 dark:!text-emerald-400">
            Output
          </h3>
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, saveDefinition)}
            onDoubleClick={() => handleDoubleClick(saveDefinition)}
            className="floimg-palette-item floimg-palette-item--emerald"
          >
            <div className="floimg-palette-item__title">Save</div>
            <div className="floimg-palette-item__desc">Save to file</div>
          </div>
        </div>
      </div>
    </div>
  );
}
