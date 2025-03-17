import React from 'react'
import { useAuth } from '../Context/AuthContext'

function ProfilePage() {
    const { refreshTokens } = useAuth();
    return (
        <div>
            <button onClick={() => refreshTokens()} >refresh</button>
        </div>
    )
}

export default ProfilePage