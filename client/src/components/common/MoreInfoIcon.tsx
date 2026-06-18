import { IconInfoHexagon } from '@tabler/icons-react';
import { createUseStyles } from 'react-jss';

const useStyle = createUseStyles({
  svg: {
    width: '100%',
    height: '100%',
  },
});

const MoreInfoIcon = () => {
  const classes = useStyle();

  return <IconInfoHexagon size={24} className={classes.svg} color="#444" />;
};

export default MoreInfoIcon;
