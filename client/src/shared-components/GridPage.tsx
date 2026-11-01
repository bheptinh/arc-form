import { ReactNode } from 'react';

import classes from './GridPage.module.css';

type Props = {
  title: ReactNode;
  actions?: ReactNode;
  intro?: ReactNode;
  isLoading?: boolean;
  onLoadMore?: () => void;
  children: ReactNode;
};

export function GridPage({ title, actions, intro, isLoading, onLoadMore, children }: Props) {
  return (
    <div className={classes.page}>
      <div className={`${classes.top} ${classes.content}`}>
        <div className={classes.titleRow}>
          <div className={classes.title}>{title}</div>
          {actions}
        </div>
      </div>

      <div className={classes.scroll}>
        {isLoading && (
          <div className={classes.preloader}>
            <div className="preloader-cube" />
          </div>
        )}
        <div className={classes.content}>
          {intro}
          <div className={classes.grid}>
            {children}
            {onLoadMore && (
              <div className={classes.loadMore} onClick={onLoadMore}>
                Load more
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
