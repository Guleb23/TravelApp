import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const showCustomToast = ({ type = 'success', title, message }) => {
    toast.custom((t) => (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full shadow-xl rounded-xl px-5 py-4 border-l-4 ${type === 'success'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                }`}
        >
            <div className="flex gap-3 items-start">
                <div className="text-2xl">
                    {type === 'success' ? '✅' : '❌'}
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-gray-800">{title}</p>
                    <p className="text-sm text-gray-600">{message}</p>
                </div>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                >
                    ×
                </button>
            </div>
        </motion.div>
    ));
};