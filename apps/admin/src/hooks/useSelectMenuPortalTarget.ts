import { RefObject, useEffect, useLayoutEffect, useState } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface UseSelectMenuPortalTargetOptions {
  menuPortalTarget?: HTMLElement | null;
  containerRef?: RefObject<HTMLElement>;
}

export const useSelectMenuPortalTarget = (
  { menuPortalTarget, containerRef }: UseSelectMenuPortalTargetOptions = {},
) => {
  const [resolvedTarget, setResolvedTarget] = useState<HTMLElement | undefined>(() => {
    if (typeof window === 'undefined') return undefined;
    if (menuPortalTarget === null) return undefined;
    if (menuPortalTarget) return menuPortalTarget;

    const container = containerRef?.current;
    const dialogContent = container?.closest?.('[data-radix-dialog-content]') as HTMLElement | null;

    return dialogContent ?? window.document.body;
  });

  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    let nextTarget: HTMLElement | undefined;

    if (menuPortalTarget === null) {
      nextTarget = undefined;
    } else if (menuPortalTarget) {
      nextTarget = menuPortalTarget;
    } else {
      const container = containerRef?.current;
      const dialogContent = container?.closest?.('[data-radix-dialog-content]') as HTMLElement | null;
      nextTarget = dialogContent ?? window.document.body;
    }

    if (nextTarget && nextTarget !== window.document.body) {
      nextTarget.setAttribute('data-scroll-lock-scrollable', 'true');
    }

    setResolvedTarget((previous) => (previous === nextTarget ? previous : nextTarget));
  }, [menuPortalTarget, containerRef]);

  return resolvedTarget;
};

export default useSelectMenuPortalTarget;
