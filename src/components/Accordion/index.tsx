import { classNames } from 'app/functions';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';

function Accordion ( { header, toggle = '', showIcon = true, children, className = '' }: { header: any, toggle?: any, showIcon?: boolean } & React.HTMLAttributes<HTMLDivElement> ): JSX.Element {
    const [ isActive, setIsActive ] = useState( false );

    return (
        <React.Fragment>
            <button className={ classNames( "accordion-item", className ) } onClick={ () => setIsActive( !isActive ) } >
                <div>{ header }</div>
                <div className="text-xs sm:text-base flex items-center space-x-4">
                    { toggle }
                    { showIcon && <div>{ isActive ? <ChevronUp /> : <ChevronDown /> } </div> }
                </div>
            </button>
            { isActive && <div className="accordion-content">{ children }</div> }
        </React.Fragment>
    );
};

export default Accordion;