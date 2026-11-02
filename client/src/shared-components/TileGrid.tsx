import clsx from 'clsx';
import type { ComponentProps, PropsWithChildren } from 'react';

import classes from './TileGrid.module.css';

type GridProps = ComponentProps<'div'> & {
  size?: 'big' | 'medium' | 'small';
};

type ItemProps = ComponentProps<'div'> & {
  active?: boolean;
};

type CornerProps = ComponentProps<'div'> & {
  position: 'top-left' | 'top-right' | 'bottom-right';
  // hover: hidden until the tile is hovered; idle: hidden while it is hovered.
  reveal?: 'always' | 'hover' | 'idle';
};

const cornerPositions = {
  'top-left': classes.topLeft,
  'top-right': classes.topRight,
  'bottom-right': classes.bottomRight,
};

const cornerReveals = {
  always: undefined,
  hover: classes.revealHover,
  idle: classes.revealIdle,
};

function TileGridItem({ active, className, ...props }: ItemProps) {
  return <div className={clsx(classes.item, { [classes.active]: active }, className)} {...props} />;
}

// Square image area; holds the image, corners and bar.
function TileGridMedia({ children }: PropsWithChildren) {
  return <div className={classes.media}>{children}</div>;
}

// Clamped to two lines, hidden at the small size.
function TileGridTitle({ children }: PropsWithChildren) {
  return (
    <div className={classes.title}>
      <div>{children}</div>
    </div>
  );
}

function TileGridCorner({ position, reveal = 'always', className, ...props }: CornerProps) {
  return (
    <div
      className={clsx(classes.corner, cornerPositions[position], cornerReveals[reveal], className)}
      {...props}
    />
  );
}

function TileGridBar({ children }: PropsWithChildren) {
  return <div className={classes.bar}>{children}</div>;
}

function TileGridOverlay(props: ComponentProps<'div'>) {
  return <div className={classes.overlay} {...props} />;
}

export function TileGrid({ size = 'big', className, ...props }: GridProps) {
  return (
    <div
      className={clsx(
        classes.grid,
        { [classes.medium]: size === 'medium', [classes.small]: size === 'small' },
        className
      )}
      {...props}
    />
  );
}

TileGrid.Item = TileGridItem;
TileGrid.Media = TileGridMedia;
TileGrid.Title = TileGridTitle;
TileGrid.Corner = TileGridCorner;
TileGrid.Bar = TileGridBar;
TileGrid.Overlay = TileGridOverlay;
