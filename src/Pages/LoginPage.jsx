import React, { useState } from 'react'
import CustomInput from '../Components/CustomInput'
import "../Font.css"
import CustomBtn from '../Components/CustomBtn'
import CustomBr from '../Components/CustomBr'
import { Link, useNavigate } from 'react-router'
import { useAuth } from "../Context/AuthContext"
import { BsGeoAlt } from 'react-icons/bs'

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            await login(email, password);
            alert('Добро пожаловать!');
            navigate(`/`);
        } catch (error) {
            alert('Ошибка!');
        }
    };


    return (
        <section className='w-screen h-screen flex justify-center items-center  '>
            <div className='flex flex-col w-xl h-[85vh]  rounded-2xl shadow-[0px_10px_15px_-3px_rgba(0,_0,_0,_0.1)]   font-main text-white '>
                <div className='bg-[#94a56f] h-1/3  w-full flex flex-col  rounded-t-2xl p-6' >
                    <div className='flex flex-col justify-center items-center gap-6'>
                        <div className='w-16 h-16 rounded-full bg-white flex items-center justify-center' >
                            <BsGeoAlt color='#94a56f' size={40} />
                        </div>
                        <div className='flex flex-col gap-4 items-center'>
                            <h1 className='text-3xl font-bold text-center'>Добро пожаловать в План Путешествий</h1>
                            <p className='text-[18px] text-center'>Войдите, чтобы продолжить работу</p>
                        </div>
                    </div>
                </div>
                <div className=' flex-1 p-6 flex flex-col gap-6'>
                    <CustomInput value={email} handleChange={(newValue) => setEmail(newValue)} label={`Email`} placeholder={`вы@example.com`} />

                    <CustomInput value={password} handleChange={(newValue) => setPassword(newValue)} type={`password`} label={`Пароль`} placeholder={`Пароль`} />

                    <CustomBtn onClick={handleSubmit} text={`Войти`} customStyles={`bg-[#94a56f] font-main`} />
                    <div className='text-black font-main text-center'>
                        <p className='inline-block pr-1'>Нет аккаунта? </p>
                        <Link to={`/registration`}>
                            <button className='inline-block text-[#94a56f] cursor-pointer' >Зарегистрируйтесь</button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default LoginPage
