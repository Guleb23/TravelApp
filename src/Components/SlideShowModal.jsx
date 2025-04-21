// components/SlideshowModal.jsx
import React, { useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const SlideshowModal = ({ photos, isOpen, onClose, currentSlide, setCurrentSlide }) => {
    useEffect(() => {
        if (!isOpen || photos.length === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % photos.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [isOpen, photos.length]);

    const prevSlide = () => {
        setCurrentSlide((currentSlide - 1 + photos.length) % photos.length);
    };

    const nextSlide = () => {
        setCurrentSlide((currentSlide + 1) % photos.length);
    };

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/70" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-90"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-90"
                        >
                            <Dialog.Panel className="relative w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <button
                                    onClick={onClose}
                                    className="absolute top-3 right-3 text-gray-600 hover:text-black"
                                >
                                    <X size={24} />
                                </button>

                                <div className="flex items-center justify-center gap-4">
                                    <button
                                        onClick={prevSlide}
                                        className="text-gray-700 hover:text-black transition"
                                    >
                                        <FaChevronLeft size={28} />
                                    </button>

                                    <motion.img
                                        key={photos[currentSlide]?.filePath}
                                        src={`https://guleb23-apifortravel-a985.twc1.net/${photos[currentSlide]?.filePath}`}
                                        alt="Слайд"
                                        className="max-h-[70vh] rounded-xl object-contain shadow-md"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.4 }}
                                    />

                                    <button
                                        onClick={nextSlide}
                                        className="text-gray-700 hover:text-black transition"
                                    >
                                        <FaChevronRight size={28} />
                                    </button>
                                </div>

                                <div className="mt-4 text-center text-sm text-gray-500">
                                    {currentSlide + 1} / {photos.length}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default SlideshowModal;
