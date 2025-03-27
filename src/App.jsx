import React, { useState } from 'react'
import './App.css'
import { Route, Routes } from 'react-router'
import HomePage from './Pages/HomePage'
import LoginPage from './Pages/LoginPage'
import RegistrationPage from './Pages/RegistrationPage'
import HomePageLayout from './Pages/HomePageLayout'
import PrivateRoute from './Helpers/PrivateRoute'
import NewsPage from './Pages/NewsPage'
import ProfilePage from './Pages/ProfilePage'
import NewTravel from './Pages/NewTravel'


function App() {

  return (
    <>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/registration' element={<RegistrationPage />} />

        <Route element={<PrivateRoute />}>
          <Route element={<HomePageLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/news" element={<ProfilePage />} />
            <Route path="/profile/:id" element={<NewTravel />} />
            <Route path="/profile" element={<NewTravel />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
