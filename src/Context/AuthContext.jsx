import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const INITIAL_URL = "https://localhost:7110/";
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || null);
    const [isLoading, setIsLoading] = useState(true); // Для отслеживания загрузки

    // Функция для входа
    const login = async (email, password) => {
        try {
            const response = await fetch(`${INITIAL_URL}api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            setUser({ email });
            setAccessToken(data.AccessToken);


            localStorage.setItem('accessToken', data.AccessToken);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // Функция для регистрации
    const register = async (email, password) => {
        try {
            const response = await fetch(`${INITIAL_URL}api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Regesitration failed');
            }

            const data = await response.json();
            setUser({ email });
            setAccessToken(data.AccessToken);


            localStorage.setItem('accessToken', data.AccessToken);

        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // Функция для выхода
    const logout = () => {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('accessToken');
    };

    // Функция для обновления токенов
    const refreshTokens = async () => {
        try {
            const response = await fetch(`${INITIAL_URL}api/refresh`, {
                method: 'POST',
                credentials: 'include',
            });

            console.log('Refresh token response status:', response.status); // Логируем статус
            console.log('Refresh token response headers:', [...response.headers.entries()]); // Логируем заголовки

            if (!response.ok) {
                const errorData = await response.json(); // Логируем тело ошибки
                console.error('Refresh token error data:', errorData);
                throw new Error('Token refresh failed');
            }

            const data = await response.json();
            console.log('Refresh token success data:', data); // Логируем успешный ответ

            setAccessToken(data.AccessToken);
            localStorage.setItem('accessToken', data.AccessToken);
        } catch (error) {
            console.error('Token refresh error:', error);
            logout(); // Выход, если обновление токенов не удалось
        }
    };

    // Проверка авторизации при запуске приложения
    useEffect(() => {
        const checkAuth = async () => {
            if (accessToken) {
                try {
                    // Проверяем валидность access-токена
                    const response = await fetch(`${INITIAL_URL}api/validate-token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });

                    if (!response.ok) {
                        // Если access-токен невалиден, пробуем обновить токены
                        await refreshTokens();
                    } else {
                        // Если access-токен валиден, устанавливаем пользователя
                        const userData = await response.json();
                        setUser(userData);

                    }
                } catch (error) {
                    console.error('Auth check error:', error);
                    logout(); // Выход, если проверка не удалась
                }
            }
            setIsLoading(false); // Завершаем загрузку
        };

        checkAuth();
    }, []);

    // Эффект для автоматического обновления токенов
    useEffect(() => {
        if (accessToken) {
            const interval = setInterval(() => {
                refreshTokens();
            }, 10 * 60 * 1000); // Обновляем токены каждые 5 минут

            return () => clearInterval(interval);
        }
    }, [accessToken]);

    // Если идёт загрузка, показываем лоадер
    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, accessToken, login, register, refreshTokens, logout, isAuthenticated: !!accessToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};