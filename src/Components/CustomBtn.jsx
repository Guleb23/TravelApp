import React from 'react'

function CustomBtn({ customStyles, text, onClick }) {
    return (
        <button onClick={onClick} className={`${customStyles && customStyles} w-full h-9 rounded-xl font-main text-[14px]`}>
            {text}
        </button>
    )
}

export default CustomBtn