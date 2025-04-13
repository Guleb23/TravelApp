import React from 'react'
import CustomInput from '../Components/CustomInput'
import "../Font.css"
import CustomBtn from '../Components/CustomBtn'
import { Link, useNavigate } from 'react-router'
import { useAuth } from "../Context/AuthContext"
import { BsGeoAlt } from 'react-icons/bs'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// Схема валидации
const schema = yup.object().shape({
    email: yup.string().email('Некорректный email').required('Email обязателен'),
    password: yup.string().min(6, 'Минимум 6 символов').required('Пароль обязателен'),
});

const LoginPage = () => {
    const { login } = useAuth();
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
            await login(data.email, data.password);
            toast.success('Добро пожаловать!');
            navigate(`/`);
        } catch (error) {
            toast.error('Ошибка входа! Проверьте данные.');
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
                            <h1 className='text-3xl font-bold text-center'>Добро пожаловать в План Путешествий</h1>
                            <p className='text-[18px] text-center'>Войдите, чтобы продолжить работу</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className='flex-1 p-6 flex flex-col gap-6'>
                    <div>
                        <CustomInput
                            {...register("email")}
                            label="Email"
                            placeholder="вы@example.com"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <CustomInput
                            {...register("password")}
                            type="password"
                            label="Пароль"
                            placeholder="Пароль"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                    </div>

                    <CustomBtn type="submit" text="Войти" customStyles="bg-[#94a56f] font-main" />

                    <div className='text-black font-main text-center'>
                        <p className='inline-block pr-1'>Нет аккаунта?</p>
                        <Link to={`/registration`}>
                            <button className='inline-block text-[#94a56f] cursor-pointer'>Зарегистрируйтесь</button>
                        </Link>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default LoginPage;
