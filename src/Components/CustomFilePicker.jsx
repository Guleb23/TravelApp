import React, { useRef } from 'react';

const CustomFilePicker = ({ onFilesSelected, customStyles }) => {
    const fileInputRef = useRef(null);

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(e.target.files);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer ${customStyles}`}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                multiple
            />
            <p className="text-gray-500">Нажмите для выбора файлов</p>
        </div>
    );
};

export default CustomFilePicker;