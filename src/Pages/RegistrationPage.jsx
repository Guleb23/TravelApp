import React, { useState } from 'react'
import CustomBtn from '../Components/CustomBtn'
import CustomInput from '../Components/CustomInput'
import { BsGeoAlt } from "react-icons/bs"
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../Context/AuthContext'

const RegistrationPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [psw, setPsw] = useState('');
    const [errors, setErrors] = useState({});
    const { register } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};

        if (!email) {
            newErrors.email = "Email обязателен";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Введите корректный email";
        }

        if (!username) {
            newErrors.username = "Имя пользователя обязательно";
        }

        if (!password) {
            newErrors.password = "Пароль обязателен";
        } else if (password.length < 6) {
            newErrors.password = "Пароль должен быть минимум 6 символов";
        }

        if (!psw) {
            newErrors.psw = "Подтверждение пароля обязательно";
        } else if (password !== psw) {
            newErrors.psw = "Пароли не совпадают";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            await register(email, password, username);
            alert('Успешная регистрация');
            navigate(`/`);
        } catch (error) {
            alert('Ошибка регистрации!');
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
                <div className='flex-1 p-6 flex flex-col gap-6'>
                    <div>
                        <CustomInput value={email} handleChange={setEmail} label="Email" placeholder="вы@example.com" />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <CustomInput value={username} handleChange={setUsername} label="Имя пользователя" placeholder="myusername" />
                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                    </div>

                    <div>
                        <CustomInput value={password} handleChange={setPassword} type="password" label="Пароль" placeholder="Пароль" />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <CustomInput value={psw} handleChange={setPsw} type="password" label="Подтвердите пароль" placeholder="Подтвердите пароль" />
                        {errors.psw && <p className="text-red-500 text-sm mt-1">{errors.psw}</p>}
                    </div>

                    <CustomBtn onClick={handleSubmit} text="Создать аккаунт" customStyles="bg-[#94a56f] font-main" />

                    <div className='text-black font-main text-center'>
                        <p className='inline-block pr-1'>Уже есть аккаунт?</p>
                        <Link to={`/login`}>
                            <button className='inline-block text-[#94a56f] cursor-pointer'>Войти</button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RegistrationPage;
