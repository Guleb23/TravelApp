import React from 'react'
import { Outlet } from 'react-router'
import NavBar from '../Components/NavBar'

import { useAuth } from '../Context/AuthContext';

const HomePageLayout = () => {


    return (
        <section className='w-screen h-screen overflow-x-hidden  '>
            <div className='h-full w-full flex overflow-y-hidden'>

                <NavBar />
                <div className='flex-[1_1_75%] overflow-y-auto bg-[#f9fafb]'>
                    <Outlet />
                </div>


            </div>
        </section>
    )
}

export default HomePageLayout
