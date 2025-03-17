import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router'

function NabbarButton({ text, to }) {
    const location = useLocation();
    console.log(location.pathname);


    return (
        <Link to={to}>
            <div className={`font-medium  underline-animation ${location.pathname == to ? "underline-full" : " "}`}>
                {text}
            </div>
        </Link>
    )
}

export default NabbarButton