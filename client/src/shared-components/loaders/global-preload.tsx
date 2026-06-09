import cls from 'classnames';
import { createUseStyles } from 'react-jss';

type GlobalPreloadProps = {
  loading: boolean;
};

const useStyles = createUseStyles<'preloader', GlobalPreloadProps>({
  preloader: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 999,
    background: 'rgba(0, 0, 0, 0.3)',
    display: (props) => (props.loading ? 'block' : 'none'),
  },
});

export default function GlobalPreload({ loading }: GlobalPreloadProps) {
  const classes = useStyles({ loading });
  return (
    <div className={cls('preloader', classes.preloader)}>
      <div className="preloader-cube"></div>
    </div>
  );
}
