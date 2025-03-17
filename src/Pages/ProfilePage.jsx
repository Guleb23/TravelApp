import React, { useEffect } from 'react'
import { useAuth } from '../Context/AuthContext'

function ProfilePage() {
    const { refreshTokens } = useAuth();

    const handleSubmit = async () => {
        try {
            await refreshTokens();
        } catch (error) {
            alert('Ошибка!');
        }
    };
    return (
        <div>
            <>Тут будет информация о профиле</>
            <button onClick={handleSubmit} >refresh</button>
        </div>
    )
}

export default ProfilePage