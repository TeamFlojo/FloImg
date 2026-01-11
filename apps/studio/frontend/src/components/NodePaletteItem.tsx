import type { ReactNode } from "react";
import type { NodeDefinition } from "@teamflojo/floimg-studio-shared";

export type NodePaletteColorVariant =
  | "amber"
  | "blue"
  | "teal"
  | "pink"
  | "cyan"
  | "orange"
  | "emerald"
  | "purple";

export interface NodePaletteItemProps {
  /** The node definition to render */
  definition: NodeDefinition;
  /** Color variant for the palette item */
  colorVariant: NodePaletteColorVariant;
  /** Handler for drag start - receives the definition to serialize */
  onDragStart: (e: React.DragEvent, definition: NodeDefinition) => void;
  /** Handler for double-click - adds node to canvas */
  onDoubleClick: (definition: NodeDefinition) => void;
  /** Whether this node is locked (cloud-specific, optional) */
  locked?: boolean;
  /** Handler for when a locked node is clicked (cloud-specific, optional) */
  onLockedClick?: (definition: NodeDefinition) => void;
  /** Custom badge to render (e.g., lock icon, "Cloud" tag) */
  badge?: ReactNode;
  /** Custom upgrade message for locked nodes */
  upgradeMessage?: string;
}

/**
 * A single item in the node palette. Renders with themed CSS classes
 * for consistent styling between OSS and cloud versions.
 *
 * Cloud-specific features (locking, upgrade prompts) are opt-in via props.
 */
export function NodePaletteItem({
  definition,
  colorVariant,
  onDragStart,
  onDoubleClick,
  locked = false,
  onLockedClick,
  badge,
  upgradeMessage,
}: NodePaletteItemProps) {
  const handleDragStart = (e: React.DragEvent) => {
    if (locked) {
      e.preventDefault();
      return;
    }
    onDragStart(e, definition);
  };

  const handleDoubleClick = () => {
    if (locked && onLockedClick) {
      onLockedClick(definition);
      return;
    }
    if (!locked) {
      onDoubleClick(definition);
    }
  };

  const handleClick = () => {
    if (locked && onLockedClick) {
      onLockedClick(definition);
    }
  };

  // Base class + color variant + locked state
  const className = [
    "floimg-palette-item",
    `floimg-palette-item--${colorVariant}`,
    locked && "floimg-palette-item--locked",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      draggable={!locked}
      onDragStart={handleDragStart}
      onDoubleClick={handleDoubleClick}
      onClick={locked ? handleClick : undefined}
      className={className}
    >
      <div className="floimg-palette-item__header">
        <div className="floimg-palette-item__title">{definition.label}</div>
        {badge}
      </div>
      {definition.description && !locked && (
        <div className="floimg-palette-item__desc">{definition.description}</div>
      )}
      {locked && upgradeMessage && (
        <div className="floimg-palette-item__upgrade-message">{upgradeMessage}</div>
      )}
    </div>
  );
}
