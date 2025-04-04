import React from 'react'

const CustomInput = React.forwardRef(({
    placeholder,
    type = "text",
    handleChange,
    label,
    value,
    onChange,
    name,
    ...rest
}, ref) => {
    const handleInputChange = (e) => {
        if (handleChange) {
            handleChange(e.target.value); // старый способ
        } else if (onChange) {
            onChange(e); // react-hook-form
        }
    };

    return (
        <div className='flex flex-col gap-1.5'>
            {label && <label className='font-main text-black'>{label}</label>}
            <div className='w-full bg-[#f6f7fe] h-12 flex justify-center items-center px-3 border-1 border-[#d9d9d9] rounded-2xl'>
                <input
                    name={name}
                    ref={ref}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={handleInputChange}
                    className='text-black w-full appearance-none outline-none border-none bg-transparent p-0 m-0 font-inherit'
                    {...rest}
                />
            </div>
        </div>
    );
});

export default CustomInput;
