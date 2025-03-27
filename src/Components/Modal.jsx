import React, { useState, useEffect } from 'react'
import CustomFilePicker from './CustomFilePicker';
import CustomBtn from './CustomBtn';

const Modal = ({ show, onCloseButtonClick, onSave, pointIndex }) => {
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    // Очистка превью при размонтировании
    useEffect(() => {
        return () => {
            previews.forEach(preview => URL.revokeObjectURL(preview));
        };
    }, [previews]);

    const handleFileChange = (selectedFiles) => {
        const newFiles = Array.from(selectedFiles);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));

        setFiles(prev => [...prev, ...newFiles]);
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removePhoto = (index) => {
        URL.revokeObjectURL(previews[index]);
        const newFiles = [...files];
        const newPreviews = [...previews];

        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);

        setFiles(newFiles);
        setPreviews(newPreviews);
    };

    const handleSave = () => {
        onSave(pointIndex, files);
        setFiles([]);
        setPreviews([]);
        onCloseButtonClick();
    };

    if (!show) {
        return null;
    }

    return (
        <div className="z-[1000] fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center">
            <div className="w-xl h-80 bg-white rounded-2xl px-8 py-4 flex flex-col gap-4 md:w-xl md:gap-0">
                <div className='flex'>
                    <div className='flex flex-col flex-1 md:gap-1'>
                        <h1 className='text-sm font-bold md:text-2xl md:font-medium'>Выберите фото</h1>
                        <p className='text-[#8B8E91] font-medium text-sm'>Импорт фотографий</p>
                    </div>
                    <p onClick={onCloseButtonClick} className='justify-end text-end align-top cursor-pointer'>
                        &times;
                    </p>
                </div>

                <div className='flex h-full gap-3 pt-4'>
                    <div className='flex-[1_1_40%]'>
                        <CustomFilePicker
                            onFilesSelected={handleFileChange}
                            customStyles={`w-full h-full`}
                            multiple
                        />
                    </div>
                    <div className='flex flex-col flex-[1_1_60%] gap-3 h-full md:flex-[1_1_50%]'>
                        <div className='flex flex-wrap gap-2 overflow-y-auto'>
                            {previews.map((preview, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index}`}
                                        className="w-20 h-20 object-cover rounded"
                                    />
                                    <button
                                        onClick={() => removePhoto(index)}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className='justify-end mt-auto'>
                            <CustomBtn
                                onClick={handleSave}
                                customStyles={`w-full !bg-[#94a56f] text-white`}
                                text={`Загрузить`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;