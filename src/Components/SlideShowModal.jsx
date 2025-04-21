// components/SlideshowModal.jsx
import React, { useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const SlideshowModal = ({ photos, isOpen, onClose, currentSlide, setCurrentSlide }) => {
    useEffect(() => {
        if (!isOpen || photos.length === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % photos.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [isOpen, photos]);

    if (!isOpen || photos.length === 0) return null;

    const prevSlide = () => {
        setCurrentSlide((currentSlide - 1 + photos.length) % photos.length);
    };

    const nextSlide = () => {
        setCurrentSlide((currentSlide + 1) % photos.length);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full p-4 sm:p-6">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-xl"
                >
                    <FaTimes />
                </button>

                <div className="flex items-center justify-center">
                    <button
                        onClick={prevSlide}
                        className="text-gray-600 hover:text-gray-800 text-2xl px-2"
                    >
                        <FaChevronLeft />
                    </button>

                    <img
                        src={`https://guleb23-apifortravel-a985.twc1.net/${photos[currentSlide]?.filePath}`}
                        alt="Слайд"
                        className="max-h-[70vh] object-contain rounded-lg mx-4"
                    />

                    <button
                        onClick={nextSlide}
                        className="text-gray-600 hover:text-gray-800 text-2xl px-2"
                    >
                        <FaChevronRight />
                    </button>
                </div>

                <div className="mt-4 text-center text-sm text-gray-500">
                    {currentSlide + 1} / {photos.length}
                </div>
            </div>
        </div>
    );
};

export default SlideshowModal;
