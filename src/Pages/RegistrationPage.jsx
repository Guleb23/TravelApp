import React, { useState } from 'react'
import CustomBtn from '../Components/CustomBtn'
import CustomBr from '../Components/CustomBr'
import CustomInput from '../Components/CustomInput'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../Context/AuthContext'

const RegistrationPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            await register(email, password);
            alert('Успешная регистрация');
            navigate(`/`);
        } catch (error) {
            alert('Ошибка!');
        }
    };

    return (
        <section className='w-screen h-screen flex justify-center items-center '>
            <div className='  shadow-[0px_10px_15px_-3px_rgba(0,_0,_0,_0.1)] flex p-7 w-4xl h-1/2 rounded-2xl  gap-6 '>
                <div className='flex-[1_1_50%]'>
                    <img className='rounded-xl h-full object-cover object-right ' src='../Images/registr.jpg' />
                </div>
                <div className='text-white flex-[1_1_50%] flex flex-col gap-5 justify-center'>
                    <h1 className='font-main text-black text-xl font-medium'>Добро пожаловать! 👋</h1>
                    <CustomInput handleChange={setEmail} type={`text`} placeholder={`Логин`} />
                    <CustomInput handleChange={setPassword} type={`password`} placeholder={`Пароль`} />
                    <div className='flex flex-col gap-3 '>


                        <CustomBtn onClick={handleSubmit} text={`Зарегистрироваться`} customStyles={`bg-[#0C7C59] hover:bg-[#4d947efd]`} />
                        <CustomBr />
                        <Link to={`/login`}>
                            <CustomBtn text={`Войти`} customStyles={`bg-[#8B80F9] hover:bg-[#b3adf8]`} />
                        </Link>
                    </div>

                </div>

            </div>
        </section>
    )
}

export default RegistrationPage
