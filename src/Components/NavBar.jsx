import React from 'react'
import NabbarButton from './NabbarButton'

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
    return (
        <nav className='border-[#d9d9d9] border-b-1 flex items-center justify-center font-main gap-32 py-7'>
            {navbaritems.map((item, index) => (
                <NabbarButton key={index} text={item.name} to={item.to} />
            ))}
        </nav>
    )
}

export default NavBar
