import React from 'react'

function CustomInput({ placeholder, type, handleChange }) {
    return (
        <div className='w-full bg-[#f6f7fe] h-12 flex justify-center items-center px-3 border-1 border-[#d9d9d9] rounded-2xl'>
            <input onChange={(e) => handleChange(e.target.value)} className='text-black w-full appearance-none outline-none border-none bg-transparent p-0 m-0 font-inherit ' placeholder={placeholder} type={type} />
        </div>
    )
}

export default CustomInput