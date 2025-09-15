// Z-Index Management System for Modal Layers
// This ensures proper stacking order for nested modals

export const Z_INDEX = {
  // Base layers
  SIDEBAR: 1,
  MAIN_CONTENT: 10,
  HEADER: 100,
  FLOATING_BUTTONS: 1200,

  // Modal layers (increments of 1000 for clarity)
  MODAL_BASE: 9000,
  MODAL_LEVEL_1: 9000,      // First modal layer (e.g., MediaEditModal)
  MODAL_LEVEL_2: 10000,     // Second modal layer (e.g., ImageModal from MediaEditModal)
  MODAL_LEVEL_3: 11000,     // Third modal layer if needed
  MODAL_LEVEL_4: 12000,     // Fourth modal layer if needed

  // Special high-priority overlays
  TOOLTIP: 15000,
  TOAST: 20000,
  EMERGENCY: 99999,
} as const;

export type ZIndexLevel = keyof typeof Z_INDEX;

// Utility to get the next z-index level for nested modals
export const getNextModalZIndex = (currentLevel: number = Z_INDEX.MODAL_LEVEL_1): number => {
  if (currentLevel < Z_INDEX.MODAL_LEVEL_1) return Z_INDEX.MODAL_LEVEL_1;
  if (currentLevel < Z_INDEX.MODAL_LEVEL_2) return Z_INDEX.MODAL_LEVEL_2;
  if (currentLevel < Z_INDEX.MODAL_LEVEL_3) return Z_INDEX.MODAL_LEVEL_3;
  if (currentLevel < Z_INDEX.MODAL_LEVEL_4) return Z_INDEX.MODAL_LEVEL_4;

  // If we're beyond level 4, just add 1000
  return currentLevel + 1000;
};

// Utility to determine modal level from component context
export const getModalZIndex = (level: 1 | 2 | 3 | 4 = 1): number => {
  switch (level) {
    case 1: return Z_INDEX.MODAL_LEVEL_1;
    case 2: return Z_INDEX.MODAL_LEVEL_2;
    case 3: return Z_INDEX.MODAL_LEVEL_3;
    case 4: return Z_INDEX.MODAL_LEVEL_4;
    default: return Z_INDEX.MODAL_LEVEL_1;
  }
};