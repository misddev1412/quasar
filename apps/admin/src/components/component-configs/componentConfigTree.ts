import { ComponentCategory, ComponentStructureType } from '@shared/enums/component.enums';

export interface ComponentConfigNode {
  id: string;
  componentKey: string;
  displayName: string;
  description?: string | null;
  componentType: ComponentStructureType;
  category: ComponentCategory;
  position: number;
  isEnabled: boolean;
  defaultConfig: Record<string, unknown>;
  configSchema: Record<string, unknown>;
  metadata: Record<string, unknown>;
  allowedChildKeys: string[];
  previewMediaUrl?: string | null;
  parentId?: string | null;
  slotKey?: string | null;
  children?: ComponentConfigNode[];
  createdAt?: string;
  updatedAt?: string;
}

export type FlattenedComponentNode = {
  node: ComponentConfigNode;
  depth: number;
};

export const flattenComponents = (
  nodes: ComponentConfigNode[],
  depth = 0,
): FlattenedComponentNode[] => {
  return nodes.flatMap((node) => [
    { node, depth },
    ...(node.children ? flattenComponents(node.children, depth + 1) : []),
  ]);
};

export const collectDescendantIds = (node?: ComponentConfigNode): string[] => {
  if (!node?.children?.length) {
    return [];
  }
  return node.children.flatMap((child) => [child.id, ...collectDescendantIds(child)]);
};

export const findComponentById = (
  nodes: ComponentConfigNode[],
  id?: string | null,
): ComponentConfigNode | null => {
  if (!id) return null;
  for (const node of nodes) {
    if (node.id === id) return node;
    const childMatch = node.children ? findComponentById(node.children, id) : null;
    if (childMatch) return childMatch;
  }
  return null;
};
