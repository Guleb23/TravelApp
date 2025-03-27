import React from 'react'
import NabbarButton from './NabbarButton'
import { IoLogOut } from "react-icons/io5";
import { useAuth } from '../Context/AuthContext';
import { IconContext } from "react-icons";
import { IoHome } from "react-icons/io5";
import { FaCalendarAlt } from "react-icons/fa";
import { CiMap } from "react-icons/ci";
import { FaUserCircle } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";



const NavBar = () => {
    const navbaritems = [
        {
            name: "Лента",
            to: "/",
            icon: <IoHome size={25} color='#4b5563' />
        },
        {
            name: "Календарь",
            to: "/news",
            icon: <FaCalendarAlt size={25} color='#4b5563' />
        },
        {
            name: "Планировщик",
            to: "/profile",
            icon: <CiMap size={25} color='#4b5563' />
        }

    ]
    const { user, logout } = useAuth();
    const handleClick = () => {
        logout();
    }
    console.log(user);
    return (
        <nav className='border-[#919191] py-7 border-b-1 flex flex-col flex-[1_1_25%] justify-start'>
            <h1 className='text-2xl font-main pl-7 text-[#94a56f] font-bold flex-[0_0_5%] '>ПланПутешествий</h1>
            <div className='flex flex-col justify-start w-full font-main py-7  mt-10 flex-[1_1_85%]'>
                {navbaritems.map((item, index) => (
                    <NabbarButton key={index} text={item.name} icon={item.icon} to={item.to} />
                ))}

            </div>
            <div className='flex flex-col gap-4 justify-center items-start flex-[1_1_10%]'>

                <div className='flex pl-7 border-gray-600 items-center gap-3 '>
                    <FaUserCircle size={40} color='#94a56f' />
                    <div className='flex flex-col'>
                        <p className='text-xl'>{user.username}</p>
                        <p className='text-gray-500'>{user.email}</p>
                    </div>
                </div>
                <button className='pl-7 flex items-center gap-3' onClick={handleClick}>
                    <IoIosLogOut size={30} />
                    <p>Выйти</p>
                </button>
            </div>
        </nav>
    )
}

export default NavBar
