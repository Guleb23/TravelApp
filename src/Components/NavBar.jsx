import React from 'react'
import NabbarButton from './NabbarButton'
import { IoLogOut } from "react-icons/io5";
import { useAuth } from '../Context/AuthContext';
import { IconContext } from "react-icons";

const NavBar = () => {
    const navbaritems = [
        {
            name: "Главная",
            to: "/"
        },
        {
            name: "Лента новостей",
            to: "/news"
        },
        {
            name: "Профиль",
            to: "/profile"
        }

    ]
    const { user, logout } = useAuth();
    const handleClick = () => {
        logout();
    }
    console.log(user);
    return (
        <nav className='border-[#919191] border-b-1 flex items-center'>
            <div className='flex items-center justify-center font-main gap-32 py-7 flex-1'>
                {navbaritems.map((item, index) => (
                    <NabbarButton key={index} text={item.name} to={item.to} />
                ))}

            </div>
            <div className='flex items-center gap-4  font-main'>
                <p>{user.email}</p>
                <button onClick={handleClick}>
                    <IconContext.Provider value={{ color: "#919191" }}>
                        <IoLogOut size={25} />
                    </IconContext.Provider>

                </button>

            </div>

        </nav>
    )
}

export default NavBar
