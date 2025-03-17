import React from 'react'
import { Outlet } from 'react-router'
import NavBar from '../Components/NavBar'

import { useAuth } from '../Context/AuthContext';

const HomePageLayout = () => {


    return (
        <section className='w-screen h-screen overflow-x-hidden '>
            <div className='h-full px-3 md:px-5 pt-12 lg:px-40 '>

                <NavBar />
                <Outlet />

            </div>
        </section>
    )
}

export default HomePageLayout
