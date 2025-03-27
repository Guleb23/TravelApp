import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router'



function NabbarButton({ text, to, icon }) {
    const location = useLocation();
    console.log(location.pathname);


    return (
        <Link to={to}>
            <div className={`w-full ${location.pathname == to ? "bg-[#f4f6f0] text-[#94a56f]  border-r-4 border-[#94a56f]" : "text-[#4b5563]"}  `}>
                <div className='pl-7 text-[16px]  font-main flex items-center gap-2.5 py-4'>
                    <div>
                        {icon}
                    </div>
                    <p>{text}</p>

                </div>
            </div>
        </Link>
    )
}

export default NabbarButton