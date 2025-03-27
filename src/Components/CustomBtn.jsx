import React from 'react'

function CustomBtn({ customStyles, text, onClick, icon }) {
    return (
        <button onClick={onClick} className={`${customStyles && customStyles} w-full h-12 rounded-xl font-main text-[14px] flex justify-center items-center`}>
            <p>{text}</p>
            {icon}
        </button>
    )
}

export default CustomBtn