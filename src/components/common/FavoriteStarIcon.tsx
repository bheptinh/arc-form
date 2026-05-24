import React, { useEffect, useRef, useState } from 'react';
import {createUseStyles} from "react-jss";

const useStyle = createUseStyles({

});

const FavoriteStarIcon = props => {
    const classes = useStyle();

    return (
        <svg  width="20" height="20" viewBox="0 0 32 32">
            <path fill="#fff" stroke="#464646" d="M3.488 13.184l6.272 6.112-1.472 8.608 7.712-4.064 7.712 4.064-1.472-8.608 6.272-6.112-8.64-1.248-3.872-7.808-3.872 7.808z"/>
        </svg>
    );
};

export default FavoriteStarIcon;