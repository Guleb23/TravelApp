// components/SlideshowModal.jsx
import React, { useEffect } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
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
                <TransitionChild
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/70" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-90"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-90"
                        >
                            <DialogPanel className="relative w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <button
                                    onClick={onClose}
                                    className="absolute top-3 right-3 text-gray-600 hover:text-black"
                                >
                                    <X size={24} />
                                </button>

                                <div className="relative w-full h-[70vh] flex items-center justify-center">
                                    <motion.img
                                        key={photos[currentSlide]?.filePath}
                                        src={`https://guleb23-apifortravel-a985.twc1.net/${photos[currentSlide]?.filePath}`}
                                        alt="Слайд"
                                        className="max-h-full max-w-full object-contain rounded-xl shadow-md"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.4 }}
                                    />

                                    <button
                                        onClick={prevSlide}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full shadow transition"
                                    >
                                        <FaChevronLeft size={24} />
                                    </button>

                                    <button
                                        onClick={nextSlide}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full shadow transition"
                                    >
                                        <FaChevronRight size={24} />
                                    </button>
                                </div>

                                <div className="mt-4 text-center text-sm text-gray-500">
                                    {currentSlide + 1} / {photos.length}
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default SlideshowModal;
