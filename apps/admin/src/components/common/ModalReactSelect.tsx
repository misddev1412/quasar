import React, { useMemo, useRef } from 'react';
import clsx from 'clsx';
import ReactSelect, {
  GroupBase,
  MenuListProps,
  Props as ReactSelectProps,
  components as selectComponents,
} from 'react-select';
import { useSelectMenuPortalTarget } from '../../hooks/useSelectMenuPortalTarget';

export interface ModalReactSelectProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> extends ReactSelectProps<Option, IsMulti, Group> {
  containerClassName?: string;
}

export function ModalReactSelect<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  containerClassName,
  className,
  classNamePrefix = 'react-select',
  components,
  menuPortalTarget,
  menuShouldBlockScroll = false,
  menuShouldScrollIntoView = false,
  menuPosition: providedMenuPosition,
  ...restProps
}: ModalReactSelectProps<Option, IsMulti, Group>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resolvedMenuPortalTarget = useSelectMenuPortalTarget({
    menuPortalTarget,
    containerRef,
  });

  const isPortaledToBody =
    typeof window !== 'undefined' && resolvedMenuPortalTarget === window.document.body;

  const menuPosition = providedMenuPosition ?? (isPortaledToBody ? 'fixed' : 'absolute');

  const mergedComponents = useMemo(() => {
    if (components?.MenuList) {
      return components;
    }

    const BaseMenuList = selectComponents.MenuList as React.ComponentType<MenuListProps<Option>>;

    const ModalMenuList: React.FC<MenuListProps<Option>> = (props) => {
      const { innerProps, innerRef, children, ...rest } = props;

      const mergedInnerProps = {
        ...(innerProps ?? {}),
        onWheel: (event: React.WheelEvent<HTMLDivElement>) => {
          const target = event.currentTarget;
          const previousScrollTop = target.scrollTop;
          target.scrollTop += event.deltaY;

          if (target.scrollTop !== previousScrollTop) {
            event.preventDefault();
            event.stopPropagation();
          }

          innerProps?.onWheel?.(event);
        },
      };

      return (
        <BaseMenuList
          {...rest}
          innerRef={innerRef}
          innerProps={mergedInnerProps}
        >
          {children}
        </BaseMenuList>
      );
    };

    return {
      ...components,
      MenuList: ModalMenuList,
    };
  }, [components]);

  return (
    <div ref={containerRef} className={containerClassName}>
      <ReactSelect<Option, IsMulti, Group>
        {...restProps}
        components={mergedComponents}
        menuPortalTarget={resolvedMenuPortalTarget}
        menuPosition={menuPosition}
        menuShouldBlockScroll={menuShouldBlockScroll}
        menuShouldScrollIntoView={menuShouldScrollIntoView}
        className={clsx(
          'react-select-container',
          isPortaledToBody && 'react-select-container--body-portal',
          className,
        )}
        classNamePrefix={classNamePrefix}
      />
    </div>
  );
}

export default ModalReactSelect;
