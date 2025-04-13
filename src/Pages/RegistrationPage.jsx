import React from 'react'
import CustomBtn from '../Components/CustomBtn'
import CustomInput from '../Components/CustomInput'
import { BsGeoAlt } from "react-icons/bs"
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../Context/AuthContext'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// Схема валидации
const schema = yup.object().shape({
    email: yup.string().email('Введите корректный email').required('Email обязателен'),
    username: yup.string().required('Имя пользователя обязательно'),
    password: yup.string().min(6, 'Минимум 6 символов').required('Пароль обязателен'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password'), null], 'Пароли не совпадают')
        .required('Подтверждение пароля обязательно'),
});

const RegistrationPage = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            await registerUser(data.email, data.password, data.username);
            toast.success('Успешная регистрация');
            navigate('/');
        } catch (error) {
            if (error?.response?.status === 409) {
                toast.error("Пользователь с таким email уже существует");
            } else {
                toast.error("Произошла ошибка при регистрации");
            }
        }
    };

    return (
        <section className='w-screen h-screen flex justify-center items-center'>
            <div className='flex flex-col w-xl h-[85vh] rounded-2xl shadow-[0px_10px_15px_-3px_rgba(0,_0,_0,_0.1)] font-main text-white'>
                <div className='bg-[#94a56f] h-1/3 w-full flex flex-col rounded-t-2xl p-6'>
                    <div className='flex flex-col justify-center items-center gap-6'>
                        <div className='w-16 h-16 rounded-full bg-white flex items-center justify-center'>
                            <BsGeoAlt color='#94a56f' size={40} />
                        </div>
                        <div className='flex flex-col gap-4 items-center'>
                            <h1 className='text-3xl font-bold'>Создать аккаунт</h1>
                            <p className='text-[18px] text-center'>Присоединяйся к ПланПутешествий, чтобы начать планировать свои приключения</p>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className='flex-1 p-6 flex flex-col gap-6' noValidate>
                    <div>
                        <CustomInput {...register('email')} label="Email" placeholder="вы@example.com" />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <CustomInput {...register('username')} label="Имя пользователя" placeholder="myusername" />
                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                    </div>

                    <div>
                        <CustomInput {...register('password')} type="password" label="Пароль" placeholder="Пароль" />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                    </div>

                    <div>
                        <CustomInput {...register('confirmPassword')} type="password" label="Подтвердите пароль" placeholder="Подтвердите пароль" />
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                    </div>

                    <CustomBtn type="submit" text="Создать аккаунт" customStyles="bg-[#94a56f] font-main" />

                    <div className='text-black font-main text-center'>
                        <p className='inline-block pr-1'>Уже есть аккаунт?</p>
                        <Link to={`/login`}>
                            <button className='inline-block text-[#94a56f] cursor-pointer'>Войти</button>
                        </Link>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default RegistrationPage;
