import React, { useEffect } from 'react'
import { useAuth } from '../Context/AuthContext'

function ProfilePage() {
    const { refreshTokens } = useAuth();
    useEffect(() => {
        handleSubmit();
    })

    const handleSubmit = async () => {
        try {
            await refreshTokens();
        } catch (error) {
            alert('Ошибка!');
        }
    };
    return (
        <div>
            <button onClick={() => refreshTokens()} >refresh</button>
        </div>
    )
}

export default ProfilePage