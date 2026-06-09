import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';

const useStyle = createUseStyles({
  svg: {
    width: '100%',
    height: '100%',
  },
});

const MoreInfoIcon = (props) => {
  const classes = useStyle();

  return (
    <svg width="23" height="23" fill="none" viewBox="0 0 23 23" className={classes.svg}>
      <path
        fill="#444"
        d="M8.268 20.389v-2.285l1.415-.357V10.98L8 10.624V8.328h5.595v9.419l1.405.357v2.285H8.268ZM9.572 6.043V3h4.024v3.043H9.572Z"
      />
    </svg>

    /*<svg width="5" height="13" fill="none" viewBox="0 0 5 13">
            <path fill="#444444" d="M.277 12.237v-1.59l.986-.25v-4.71l-1.172-.25V3.838h3.897v6.56l.978.248v1.591H.277Zm.908-9.99V.127h2.803v2.12H1.185Z"/>
        </svg>*/
  );
};

export default MoreInfoIcon;
