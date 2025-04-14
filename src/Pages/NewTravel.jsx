import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaSave } from "react-icons/fa";
import CustomInput from '../Components/CustomInput';
import debounce from 'lodash.debounce';
import { useLocation, useNavigate, useParams } from 'react-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Modal from '../Components/Modal';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';
import { BsCheckCircle, BsExclamationDiamond } from 'react-icons/bs';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import '../travels.css'
import toast from 'react-hot-toast';
import { showCustomToast } from "../Helpers/showCustomToast";


const POINT_TYPES = {
    attraction: {
        name: "Достопримечательность",
        duration: 60
    },
    restaurant: {
        name: "Ресторан/Кафе",
        duration: 45
    },
    shopping: {
        name: "Магазин",
        duration: 30
    },

};
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const HomePage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [originalPoints, setOriginalPoints] = useState([]); // Добавляем состояние для исходного массива
    const [selectedPointIndex, setSelectedPointIndex] = useState(null);//Для загрузки фото
    const [points, setPoints] = useState([]);//Для точек
    const [inputValue, setInputValue] = useState('');//Для подсказок
    const [suggestions, setSuggestions] = useState([]);//Сами подсказки
    const [isAdding, setIsAdding] = useState(false);//Флаг добавления
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);//Выбранная подсказка
    const mapRef = useRef(null);//Реф карты
    const markersRef = useRef([]);//Реф маркеров
    const location = useLocation();//Для получения даты из календаря
    const { date, onTravelCreated } = location.state || {};//Сама дата
    const [title, setTitle] = useState();//Название путешествия
    const [dateState, setDateState] = useState(date);//Сама дата
    const [showModal, setShowModal] = useState(false);//Показать\скрыть модальное окно
    const polylinesRef = useRef([]);//Сссылка для маршрута
    const navigator = useNavigate();//Хук навигации
    const [routeCalculations, setRouteCalculations] = useState({
        inProgress: false,
        lastAbortController: null
    });
    //Если есть старые маршруты удалем их
    if (!window.routePolylines) {
        window.routePolylines = [];
    }
    //Форматирование даты
    const formatDate = (date) => {
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .split('T')[0];
    };
    //Пересчитывание маршрута
    const recalculateAllRoutes = async (pointsArray) => {
        if (pointsArray.length < 2) return pointsArray;

        const updatedPoints = [...pointsArray];

        if (!updatedPoints[0].departureTime) {
            updatedPoints[0].departureTime = "08:00";
        }

        for (let i = 0; i < updatedPoints.length - 1; i++) {
            const startPoint = updatedPoints[i];
            const endPoint = updatedPoints[i + 1];

            const departureTime = i === 0
                ? startPoint.departureTime
                : startPoint.arrivalTime;

            const result = await calculateArrivalTime(
                startPoint,
                endPoint,
                departureTime
            );

            if (result) {
                updatedPoints[i + 1].arrivalTime = result.arrivalTime;
                updatedPoints[i + 1].duration = result.duration;

                drawRoute(
                    result.routeCoordinates,
                    startPoint,
                    endPoint,
                    result.duration
                );
            }
        }

        return updatedPoints;
    };
    //Запрос на сервер
    const handleUpdate = useCallback(async () => {
        try {
            // Валидация данных
            if (!title || !dateState) {
                throw new Error('Название и дата обязательны для заполнения');
            }

            if (points.length < 2) {
                throw new Error('Должно быть минимум 2 точки маршрута');
            }

            // Подготовка данных
            const payload = {
                title,
                date: dateState,
                points: points.map((point, index) => {
                    if (!point.name || !point.address || !point.coordinates) {
                        throw new Error(`Точка #${index + 1} содержит неполные данные`);
                    }

                    return {
                        id: point.id || 0,
                        name: point.name,
                        address: point.address,
                        type: point.type || 'attraction',
                        departureTime: index === 0 ? point.departureTime || '08:00' : undefined,
                        coordinates: point.coordinates,
                        note: point.note,
                        photos: point.photos?.map(photo => ({
                            id: photo.id || 0,
                            fileName: photo.file?.name || photo.filePath?.split('/').pop() || `photo_${Date.now()}`,
                            base64Content: photo.Base64Content,
                            filePath: photo.filePath,
                        })) || [],
                    };
                }),
            };

            // Отправка запроса
            const response = await axios.patch(
                `https://guleb23-apifortravel-a985.twc1.net/api/travels/${id}`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    timeout: 10000
                }
            );

            // Обработка успешного ответа
            if (response.status === 200) {
                const updatedTravel = response.data;

                // Обновляем точки с сервера для синхронизации
                const pointsResponse = await axios.get(
                    `https://guleb23-apifortravel-a985.twc1.net/api/points/${id}`
                );

                const updatedPoints = await processPoints(pointsResponse.data);

                // Обновление состояния
                setTitle(updatedTravel.title);
                setDateState(formatDate(new Date(updatedTravel.date)));
                setPoints(updatedPoints);
                console.log(updatedPoints);


                showCustomToast({
                    type: 'success',
                    title: 'Путешествие обновлено!',
                    message: 'Все изменения сохранены. Отличная работа ✨'
                });
                navigator('/news', { state: { refresh: true } });
            } else {
                throw new Error(`Ошибка сервера: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Update error:', error);
            showCustomToast({
                type: 'error',
                title: 'Ошибка при обновлении',
                message: 'Попробуйте позже'
            });

        }
    }, [id, title, dateState, points, navigator]);
    const processPoints = async (pointsData) => {
        return await Promise.all(
            pointsData.map(async point => ({
                ...point,
                photos: point.photos ? await processPhotos(point.photos) : []
            }))
        );
    };
    const processPhotos = async (photos) => {
        return Promise.all(photos.map(async photo => {
            const imageUrl = `https://guleb23-apifortravel-a985.twc1.net/${photo.filePath.replace(/\\/g, '/')
                }`;
            return {
                ...photo,
                preview: imageUrl,
                Base64Content: null
            };
        }));
    };
    const fetchTravels = async () => {
        try {
            const response = await axios.get(`https://guleb23-apifortravel-a985.twc1.net/api/points/${id}`);
            console.log(response.data);

            // Преобразуем пути к фото в полные URL
            const pointsWithPhotos = await Promise.all(
                response.data.map(async point => ({
                    ...point,
                    photos: point.photos
                        ? await Promise.all(point.photos.map(async photo => {
                            // Формируем полный URL до изображения
                            const imageUrl = `https://guleb23-apifortravel-a985.twc1.net/${photo.filePath.replace(/\\/g, '/')}`;
                            return {
                                id: photo.id,
                                filePath: photo.filePath,
                                preview: imageUrl, // Используем прямой URL
                                Base64Content: null // Можно заполнить при необходимости
                            };
                        }))
                        : []
                }))
            );

            setPoints(pointsWithPhotos);
            const pointsWithRoutes = await recalculateAllRoutes(pointsWithPhotos);
            setPoints(pointsWithRoutes);
            setOriginalPoints([...pointsWithPhotos]); // Сохраняем исходный массив

        } catch (err) {
            console.error('Ошибка при загрузке:', err);
        }
    };
    // Загрузка данных о путешествиях
    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const response = await axios.get(`https://guleb23-apifortravel-a985.twc1.net/api/travel/${id}`);
                    setTitle(response.data[0].title);
                    const formattedDate = formatDate(new Date(response.data[0].date));
                    setDateState(formattedDate);

                } catch (err) {
                    console.log(err);

                }
            }

            fetchData();


            fetchTravels();
        }
    }, [id]);

    //Конпки для перемещения
    //ВВЕРХ
    const movePointUp = async (index) => {
        if (index <= 1) {
            if (index === 0) showCustomToast({
                type: 'error',
                title: 'Начальная точка не может быть перемещена',
                message: 'Переместите другую точку'
            });
            if (index === 1) toast.error("Нельзя перемещать точку перед начальной");
            return;
        }

        clearAllRoutes();

        const newPoints = [...points];
        [newPoints[index], newPoints[index - 1]] = [newPoints[index - 1], newPoints[index]];

        setPoints(newPoints);
        const updatedPoints = await recalculateRoutes(newPoints);
        setPoints(updatedPoints);
    };
    //ВНИЗ
    const movePointDown = async (index) => {
        if (index === 0) {
            showCustomToast({
                type: 'error',
                title: 'Начальная точка не может быть перемещена',
                message: 'Переместите другую точку'
            });
            return;
        }
        if (index >= points.length - 1) return;

        clearAllRoutes();

        const newPoints = [...points];
        [newPoints[index], newPoints[index + 1]] = [newPoints[index + 1], newPoints[index]];

        setPoints(newPoints);
        const updatedPoints = await recalculateRoutes(newPoints);
        setPoints(updatedPoints);
    };
    //Очитска маршрутов
    const clearAllRoutes = () => {
        // Удаляем все полилинии с карты
        if (polylinesRef.current) {
            polylinesRef.current.forEach(polyline => {
                if (polyline && mapRef.current) {
                    mapRef.current.removeLayer(polyline);
                }
            });
            polylinesRef.current = [];
        }

        // Также очищаем глобальный массив, если он используется
        if (window.routePolylines) {
            window.routePolylines.forEach(polyline => {
                if (polyline && mapRef.current) {
                    mapRef.current.removeLayer(polyline);
                }
            });
            window.routePolylines = [];
        }
    };

    //Запрос для сохранения маршрута
    const handleSave = useCallback(async () => {
        try {
            const payload = {
                title,
                date: dateState,
                points: points
            };
            console.log(payload);
            axios.post(`https://guleb23-apifortravel-a985.twc1.net/api/users/${user.id}/travels`, payload);

            showCustomToast({
                type: 'success',
                title: 'Маршрут сохранен!',
                message: 'Удачного пути!'
            });
            if (onTravelCreated) {
                onTravelCreated();
            }
            navigator('/news');

        } catch (err) {
            console.error('Ошибка:', err);
            toast.error(`Не удалось сохранить: ${err.message}`);
        }
    }, [title, dateState, points]);
    //Открытие модлаьного окна для фото
    const toggleShowModal = () => {
        setShowModal(!showModal);
    };
    //Получение случайного цвета для маршрута
    const getRandomBrightColor = () => {
        // Генерируем насыщенные цвета в HSV, затем конвертируем в RGB
        const hue = Math.floor(Math.random() * 360); // Полный диапазон оттенков
        const saturation = 70 + Math.floor(Math.random() * 30); // 70-100% насыщенность
        const value = 80 + Math.floor(Math.random() * 20); // 80-100% яркость

        // Конвертация HSV в RGB
        const c = (value / 100) * (saturation / 100);
        const x = c * (1 - Math.abs(((hue / 60) % 2 - 1)))
        const m = (value / 100) - c

        let r, g, b;
        if (hue < 60) { [r, g, b] = [c, x, 0]; }
        else if (hue < 120) { [r, g, b] = [x, c, 0]; }
        else if (hue < 180) { [r, g, b] = [0, c, x]; }
        else if (hue < 240) { [r, g, b] = [0, x, c]; }
        else if (hue < 300) { [r, g, b] = [x, 0, c]; }
        else { [r, g, b] = [c, 0, x]; }

        // Преобразование в HEX
        const toHex = (val) => {
            const hex = Math.round((val + m) * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    };
    // Сохранение фото
    const handleSavePhotos = async (pointIndex, newFiles) => {
        const updatedPoints = [...points];

        if (!updatedPoints[pointIndex].photos) {
            updatedPoints[pointIndex].photos = [];
        }

        // Обрабатываем каждый файл асинхронно
        const processedFiles = await Promise.all(
            newFiles.map(async (file) => {
                const preview = URL.createObjectURL(file);
                const Base64Content = await convertFileToBase64(file);

                return {
                    file, // Сохраняем оригинальный файл
                    preview,
                    Base64Content: Base64Content.split(',')[1], // Берем только данные без префикса
                    fileName: file.name
                };
            })
        );

        updatedPoints[pointIndex].photos = [
            ...updatedPoints[pointIndex].photos,
            ...processedFiles
        ];

        setPoints(updatedPoints);
    };
    const updatePointNote = (index, note) => {
        const newPoints = [...points];
        newPoints[index].note = note;
        setPoints(newPoints);
    };
    // Вспомогательная функция для конвертации File в base64
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };
    // Инициализация карты Leaflet
    useEffect(() => {
        const mapInstance = L.map('map-container').setView([55.7522, 37.6156], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);
        mapRef.current = mapInstance;

        // Добавим флаг инициализации
        mapRef.current._initialized = true;

        return () => mapInstance.remove();
    }, []);

    // Обновление маркеров
    const updateMarkers = () => {
        if (!mapRef.current) return;

        // Удаляем старые маркеры
        markersRef.current.forEach(marker => mapRef.current.removeLayer(marker));
        markersRef.current = [];

        // Добавляем новые маркеры
        points.forEach((point, index) => {
            const marker = L.marker([point.coordinates.lat, point.coordinates.lon], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: #1E88E5; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">${index + 1}</div>`,
                    iconSize: [24, 24]
                })
            }).addTo(mapRef.current);

            marker.bindPopup(`
                <b>${point.name}</b><br/>
                ${point.address}<br/>
                ${point.arrivalTime ? `Прибытие: ${point.arrivalTime}` : `Отправление: ${point.departureTime}`}
            `);

            markersRef.current.push(marker);
        });
    };

    // Отрисовка маршрута
    // Отрисовка маршрута
    const drawRoute = (coordinates, startPoint, endPoint, duration) => {
        if (!mapRef.current || !coordinates || coordinates.length === 0) return null;

        const routeColor = getRandomBrightColor();

        // Добавляем z-index, который увеличивается с каждым новым маршрутом
        const zIndexOffset = 1000 + (polylinesRef.current.length * 10);

        const latLngs = coordinates.map(coord => [coord[1], coord[0]]);

        const polyline = L.polyline(latLngs, {
            color: routeColor,
            weight: 5,
            opacity: 0.7,
            className: 'route-polyline',
            zIndexOffset: zIndexOffset // Устанавливаем z-index
        }).addTo(mapRef.current);
        // В функции drawRoute после создания polyline добавьте:
        polyline.on('mouseover', function () {
            this.bringToFront();
            this.setStyle({
                weight: 7,
                opacity: 1
            });
        });

        polyline.on('mouseout', function () {
            this.setStyle({
                weight: 5,
                opacity: 0.7
            });
        });
        polyline.bindPopup(`
          <div class="route-popup">
            <strong>${startPoint.name} → ${endPoint.name}</strong><br>
            Время в пути: ${Math.floor(duration / 60)} мин
          </div>
        `);

        polylinesRef.current.push(polyline);
        return polyline;
    };
    //Обновляем маркеры
    useEffect(() => {
        if (mapRef.current) {
            updateMarkers();
        }

    }, [points]); // Зависимость от `points`

    // Fallback расчет маршрута
    const fallbackRouteCalculation = (startPoint, endPoint, departureTime) => {
        // Формула гаверсинусов для расчета расстояния
        const R = 6371; // Радиус Земли в км
        const dLat = toRad(endPoint.coordinates.lat - startPoint.coordinates.lat);
        const dLon = toRad(endPoint.coordinates.lon - startPoint.coordinates.lon);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(startPoint.coordinates.lat)) *
            Math.cos(toRad(endPoint.coordinates.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        // Предполагаем среднюю скорость 30 км/ч в городе
        const durationInSeconds = (distance / 30) * 3600;

        const departureTimestamp = new Date(`1970-01-01T${departureTime}:00`).getTime();
        const arrivalTimestamp = departureTimestamp + durationInSeconds * 1000;

        let additionalTime = points.indexOf(startPoint) !== 0
            ? (POINT_TYPES[startPoint.type]?.duration || 0) * 60 * 1000
            : 0;

        // Создаем упрощенный маршрут (прямая линия между точками)
        const routeCoordinates = [
            [startPoint.coordinates.lat, startPoint.coordinates.lon],
            [endPoint.coordinates.lat, endPoint.coordinates.lon]
        ];

        return {
            arrivalTime: new Date(arrivalTimestamp + additionalTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            }),
            duration: durationInSeconds + (additionalTime / 1000),
            routeCoordinates: routeCoordinates
        };
    };

    const toRad = (value) => value * Math.PI / 180;
    ///////////////////////////////////////////////////////////////Работа с подсказками/////////////////////////////////////
    // Дебаунсированная версия функции fetchSuggestions
    const debouncedFetchSuggestions = useCallback(
        debounce((query) => fetchSuggestions(query), 300),
        []
    );

    // Обработчик изменения текста в поле ввода
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        debouncedFetchSuggestions(value);
    };
    const handleDeletePhoto = async (pointId, photoId, pointIndex, photoIndex) => {
        try {
            // Если есть ID точки и ID фото, делаем запрос на сервер для удаления
            if (pointId && photoId) {
                await axios.delete(
                    `https://guleb23-apifortravel-a985.twc1.net/api/points/${pointId}/photos/${photoId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        }
                    }
                );
            }

            // Обновляем состояние независимо от успешности запроса
            setPoints(prevPoints => {
                const newPoints = [...prevPoints];
                const pointPhotos = [...newPoints[pointIndex].photos];

                // Удаляем фото из массива
                pointPhotos.splice(photoIndex, 1);

                // Обновляем точку
                newPoints[pointIndex] = {
                    ...newPoints[pointIndex],
                    photos: pointPhotos
                };

                return newPoints;
            });

        } catch (error) {
            console.error('Ошибка при удалении фото:', error);
            toast.error('Не удалось удалить фотографию');
        }
    };
    // Обработчик выбора подсказки
    const handleSuggestionClick = (suggestion) => {
        setInputValue(suggestion.display_name); // Устанавливаем выбранное значение в поле ввода
        setSelectedSuggestion(suggestion); // Сохраняем выбранную подсказку
        setSuggestions([]); // Очищаем подсказки
    };
    // Поиск мест через Nominatim
    const fetchSuggestions = async (query) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
                {
                    headers: {
                        'User-Agent': 'travelApp/1.0 tonovgleb@gmail.com' // Требуется Nominatim
                    }
                }
            );
            const data = await response.json();
            console.log(data);

            setSuggestions(data);
        } catch (error) {
            console.error('Ошибка при получении подсказок:', error);
        }
    };
    // Поиск времени работы
    const fetchOSMDetails = async (osmType, osmId) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/details?osmtype=${osmType[0].toUpperCase()}&osmid=${osmId}&format=json`,
                {
                    headers: { 'User-Agent': 'travelApp/1.0 tonovgleb@gmail.com' }
                }
            );

            const data = await response.json();

            // Упрощенное извлечение тегов
            const tags = data.tags || data.extratags || {};

            return {
                opening_hours: tags.opening_hours || null,
                website: tags.website || null,
                phone: tags.phone || null,
                name: tags.name || data.localname || null
            };
        } catch (error) {
            console.error('Error:', error);
            return {
                opening_hours: null,
                website: null,
                phone: null,
                name: null
            };
        }
    };


    ///////////////////////////////////////////////////////////////Работа с точками/////////////////////////////////////
    const recalculateRoutes = async (pointsArray) => {
        if (!mapRef.current) return pointsArray;

        // Очищаем старые маршруты
        clearAllRoutes();

        const updatedPoints = [...pointsArray];

        if (updatedPoints.length < 2) return updatedPoints;

        // Убедимся, что у первой точки есть время отправления
        if (!updatedPoints[0].departureTime) {
            updatedPoints[0].departureTime = "08:00";
        }

        // Пересчитываем все маршруты последовательно
        for (let i = 0; i < updatedPoints.length - 1; i++) {
            const startPoint = updatedPoints[i];
            const endPoint = updatedPoints[i + 1];

            const departureTime = i === 0
                ? startPoint.departureTime
                : startPoint.arrivalTime;

            const result = await calculateArrivalTime(
                startPoint,
                endPoint,
                departureTime
            );

            if (result) {
                updatedPoints[i + 1].arrivalTime = result.arrivalTime;
                updatedPoints[i + 1].duration = result.duration;

                // Рисуем новый маршрут
                drawRoute(
                    result.routeCoordinates,
                    startPoint,
                    endPoint,
                    result.duration
                );
            }
        }

        return updatedPoints;
    };
    // Функция для сохранения точки
    const savePoint = async () => {
        if (!inputValue.trim() || !selectedSuggestion) return;

        try {
            const details = selectedSuggestion.osm_type && selectedSuggestion.osm_id
                ? await fetchOSMDetails(selectedSuggestion.osm_type, selectedSuggestion.osm_id)
                : {};
            const newPoint = {
                name: details.name || selectedSuggestion.display_name,
                address: selectedSuggestion.display_name,
                coordinates: {
                    lat: parseFloat(selectedSuggestion.lat),
                    lon: parseFloat(selectedSuggestion.lon),
                },
                departureTime: points.length === 0 ? '08:00' : null,
                arrivalTime: null,
                duration: null,
                type: "attraction",
                note: "",
                photos: [],
                osmData: {
                    opening_hours: details.opening_hours || selectedSuggestion.opening_hours,
                    website: details.website || selectedSuggestion.website,
                    phone: details.phone || selectedSuggestion.phone,
                    osm_type: selectedSuggestion.osm_type,
                    osm_id: selectedSuggestion.osm_id
                }
            };

            const updatedPoints = [...points, newPoint];
            setPoints(updatedPoints);

            // Центрируем карту на новой точке
            if (mapRef.current) {
                mapRef.current.flyTo(
                    [newPoint.coordinates.lat, newPoint.coordinates.lon],
                    15,
                    { animate: true, duration: 0.5 }
                );
            }

            // Если это не первая точка, рисуем новый маршрут, сохраняя старые
            if (updatedPoints.length > 1) {
                const startPoint = updatedPoints[updatedPoints.length - 2];
                const endPoint = updatedPoints[updatedPoints.length - 1];

                const departureTime = updatedPoints.length === 2
                    ? startPoint.departureTime
                    : startPoint.arrivalTime;

                const result = await calculateArrivalTime(
                    startPoint,
                    endPoint,
                    departureTime
                );

                if (result) {
                    setPoints(prevPoints => {
                        const newPoints = [...prevPoints];
                        newPoints[newPoints.length - 1] = {
                            ...newPoints[newPoints.length - 1],
                            arrivalTime: result.arrivalTime,
                            duration: result.duration
                        };
                        return newPoints;
                    });

                    // Рисуем только новый сегмент маршрута
                    drawRoute(
                        result.routeCoordinates,
                        startPoint,
                        endPoint,
                        result.duration
                    );
                }
            }

            setInputValue('');
            setSuggestions([]);
            setSelectedSuggestion(null);
            setIsAdding(false);

        } catch (error) {
            console.error('Ошибка при сохранении точки:', error);
        }
    };
    // Функция для удаления точки
    const deletePoint = async (index) => {
        // Освобождаем память от превью фотографий
        if (points[index].photos) {
            points[index].photos.forEach(photo => {
                URL.revokeObjectURL(photo.preview);
            });
        }

        // Удаляем маршруты, связанные с этой точкой
        if (index === 0) {
            // Если удаляем первую точку, удаляем только первый маршрут
            if (polylinesRef.current[0]) {
                mapRef.current.removeLayer(polylinesRef.current[0]);
                polylinesRef.current[0] = null;
            }
        } else if (index === points.length - 1) {
            // Если удаляем последнюю точку, удаляем последний маршрут
            if (polylinesRef.current[polylinesRef.current.length - 1]) {
                mapRef.current.removeLayer(polylinesRef.current[polylinesRef.current.length - 1]);
                polylinesRef.current.pop();
            }
        } else {
            // Если удаляем точку в середине, удаляем два соседних маршрута
            if (polylinesRef.current[index - 1]) {
                mapRef.current.removeLayer(polylinesRef.current[index - 1]);
                polylinesRef.current[index - 1] = null;
            }
            if (polylinesRef.current[index]) {
                mapRef.current.removeLayer(polylinesRef.current[index]);
                polylinesRef.current[index] = null;
            }
        }

        // Фильтруем массив точек
        const newPoints = points.filter((_, i) => i !== index);

        // Пересчитываем маршруты только между соседними точками
        if (newPoints.length > 1) {
            // Удаляем все null из массива полилиний
            polylinesRef.current = polylinesRef.current.filter(Boolean);

            // Пересчитываем маршрут между точками вокруг удаленной
            const startIndex = Math.max(0, index - 1);
            const endIndex = Math.min(index, newPoints.length - 1);

            if (startIndex < endIndex) {
                const startPoint = newPoints[startIndex];
                const endPoint = newPoints[startIndex + 1];

                const departureTime = startIndex === 0
                    ? startPoint.departureTime
                    : startPoint.arrivalTime;

                const result = await calculateArrivalTime(
                    startPoint,
                    endPoint,
                    departureTime
                );

                if (result) {
                    // Обновляем время прибытия следующей точки
                    newPoints[startIndex + 1].arrivalTime = result.arrivalTime;
                    newPoints[startIndex + 1].duration = result.duration;

                    // Рисуем новый маршрут
                    const newPolyline = drawRoute(
                        result.routeCoordinates,
                        startPoint,
                        endPoint,
                        result.duration
                    );

                    // Заменяем старый маршрут в массиве
                    if (startIndex < polylinesRef.current.length) {
                        polylinesRef.current[startIndex] = newPolyline;
                    }
                }
            }
        }

        setPoints(newPoints);

        // Центрируем карту на оставшихся точках
        if (mapRef.current && newPoints.length > 0) {
            const bounds = L.latLngBounds(
                newPoints.map(p => [p.coordinates.lat, p.coordinates.lon])
            );
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    };
    // Функция для обновления типа точки
    const updatePointType = async (index, newType) => {
        const updatedPoints = [...points];
        updatedPoints[index].type = newType;

        const recalculatedPoints = await recalculateRoutes(updatedPoints);
        setPoints(recalculatedPoints);
    };
    // Функция для расчета времени прибытия через 2GIS API
    // Функция для расчета времени прибытия через GraphHopper API
    const calculateArrivalTime = async (startPoint, endPoint, departureTime) => {
        if (routeCalculations.lastAbortController) {
            routeCalculations.lastAbortController.abort();
        }

        const controller = new AbortController();
        setRouteCalculations({
            inProgress: true,
            lastAbortController: controller
        });

        try {
            const startLat = startPoint.coordinates.lat;
            const startLon = startPoint.coordinates.lon;
            const endLat = endPoint.coordinates.lat;
            const endLon = endPoint.coordinates.lon;

            const GH_API_KEY = "3de85b8c-5205-4846-9693-16486861c7d9";

            // Добавляем points_encoded=false для получения полных координат
            const url = `https://graphhopper.com/api/1/route?` +
                `point=${startLat},${startLon}&` +
                `point=${endLat},${endLon}&` +
                `vehicle=car&` +
                `points_encoded=false&` + // Важно для получения координат
                `key=${GH_API_KEY}`;

            const timeout = 15000;
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), timeout)
            );

            const response = await Promise.race([
                fetch(url, {
                    signal: controller.signal,
                    headers: {
                        'Accept': 'application/json'
                    }
                }),
                timeoutPromise
            ]);

            const data = await response.json();

            if (!data.paths || data.paths.length === 0) {
                throw new Error('No route found');
            }

            const durationInSeconds = data.paths[0].time / 1000;
            const departureTimestamp = new Date(`1970-01-01T${departureTime}:00`).getTime();
            const arrivalTimestamp = departureTimestamp + durationInSeconds * 1000;

            let additionalTime = points.indexOf(startPoint) !== 0
                ? (POINT_TYPES[startPoint.type]?.duration || 0) * 60 * 1000
                : 0;

            // Получаем координаты маршрута из ответа GraphHopper
            const routeCoordinates = data.paths[0].points.coordinates || [];

            return {
                arrivalTime: new Date(arrivalTimestamp + additionalTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                duration: durationInSeconds + (additionalTime / 1000),
                routeCoordinates: routeCoordinates
            };
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Route calculation error:', error);
                // Возвращаем fallback данные
                return fallbackRouteCalculation(startPoint, endPoint, departureTime);
            }
            return null;
        } finally {
            setRouteCalculations(prev => ({
                ...prev,
                inProgress: false
            }));
        }
    };


    // Функция для создния точек
    useEffect(() => {
        const updateMapMarkers = () => {
            if (!mapRef.current || points.length === 0) return;

            // Удаляем старые маркеры
            markersRef.current.forEach(marker => {
                mapRef.current.removeLayer(marker);
            });
            markersRef.current = [];

            // Добавляем новые маркеры
            points.forEach((point, index) => {
                // Создаем кастомную иконку с номером точки
                const icon = L.divIcon({
                    className: 'custom-marker',
                    html: `
                        <div style="
                            background-color: #1E88E5;
                            color: white;
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: bold;
                        ">
                            ${index + 1}
                        </div>
                    `,
                    iconSize: [24, 24]
                });

                // Создаем маркер
                const marker = L.marker(
                    [point.coordinates.lat, point.coordinates.lon],
                    { icon }
                ).addTo(mapRef.current);

                // Добавляем popup с информацией о точке
                marker.bindPopup(`
                    <div style="min-width: 200px;">
                        <h3 style="margin: 0 0 5px 0; font-size: 16px;">${point.name}</h3>
                        <p style="margin: 0 0 5px 0; font-size: 14px;">${point.address}</p>
                        ${point.arrivalTime ?
                        `<p style="margin: 0; font-size: 14px;">Прибытие: ${point.arrivalTime}</p>` :
                        `<p style="margin: 0; font-size: 14px;">Отправление: ${point.departureTime}</p>`
                    }
                    </div>
                `);

                // Обработчик клика на маркер
                marker.on('click', () => {
                    // Можно добавить дополнительную логику при клике
                    console.log(`Clicked on point ${index}:`, point);
                });

                markersRef.current.push(marker);
            });

            // Центрируем карту на всех маркерах, если они есть
            if (points.length > 0) {
                const group = new L.featureGroup(markersRef.current);
                mapRef.current.fitBounds(group.getBounds(), {
                    padding: [50, 50] // Отступы от краев карты
                });
            }
        };

        updateMapMarkers();
    }, [points.length]); // Зависимость от всего массива points, а не только от длины
    // Функция для обновления времени отправления
    const updateDepartureTime = async (index, value) => {
        const updatedPoints = [...points];
        updatedPoints[index].departureTime = value;

        const recalculatedPoints = await recalculateRoutes(updatedPoints);
        setPoints(recalculatedPoints);
    };
    const checkOpeningHours = (openingHours, arrivalTime) => {
        if (!openingHours || !arrivalTime) {
            return { success: true, message: 'Часы работы не указаны' };
        }



        // Parse arrival time
        const [arrivalHour, arrivalMinute] = arrivalTime.split(':').map(Number);
        const arrivalDate = new Date();
        arrivalDate.setHours(arrivalHour, arrivalMinute, 0, 0);

        // Calculate departure time (arrival + visit duration in minutes)
        const departureDate = new Date(arrivalDate.getTime() * 60000);

        // Check if the location is open during the entire visit period


        // Fallback to simple validation if library fails
        const simpleCheck = simpleOpeningHoursCheck(openingHours, arrivalTime);
        if (simpleCheck) return simpleCheck;

        return {
            success: true,
            message: 'Не удалось проверить часы работы'
        };

    };
    const simpleOpeningHoursCheck = (openingHours, arrivalTime) => {
        const timeToMinutes = (timeStr) => {
            if (!timeStr) return NaN;
            const [hours, minutes] = timeStr.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) return NaN;
            return hours * 60 + minutes;
        };

        // Try to extract basic time range (e.g., "09:00-18:00")
        const timeRangeMatch = openingHours.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
        if (!timeRangeMatch) return null;

        const openTime = timeRangeMatch[1];
        const closeTime = timeRangeMatch[2];

        const arrivalMins = timeToMinutes(arrivalTime);
        const openMins = timeToMinutes(openTime);
        const closeMins = timeToMinutes(closeTime);
        const visitEndMins = arrivalMins;

        if (isNaN(arrivalMins) || isNaN(openMins) || isNaN(closeMins)) {
            return null;
        }

        if (arrivalMins < openMins) {
            return {
                success: false,
                message: `⚠️ Еще закрыто. Откроется в ${openTime}`,
                advice: 'Придите позже'
            };
        }

        if (visitEndMins > closeMins) {
            return {
                success: false,
                message: `⚠️ Не успеете! Закрывается в ${closeTime}`,
                advice: 'Уменьшите время посещения'
            };
        }

        return {
            success: true,
            message: `✓ Открыто с ${openTime} до ${closeTime}`
        };
    };
    //Компонент рендера времени
    const TimeCheckInfo = ({ point }) => {
        if (!point.arrivalTime || !point.osmData?.opening_hours) return null;

        // Переводим duration из секунд в минуты
        const durationMinutes = Math.round((point.duration || POINT_TYPES[point.type]?.duration || 0) / 60);

        const { success, message, advice } = checkOpeningHours(
            point.osmData.opening_hours,
            point.arrivalTime,
            durationMinutes
        );

        return (
            <div className={`mt-2 p-2 rounded-md ${success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                <div className="flex items-start">
                    {success ? (
                        <BsCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                        <BsExclamationDiamond className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <div>
                        <p className="font-medium">{message}</p>
                        {advice && <p className="text-sm mt-1">{advice}</p>}
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className='h-full w-full p-4 py-7'>
            <Modal
                show={showModal}
                onCloseButtonClick={toggleShowModal}
                onSave={handleSavePhotos}
                pointIndex={selectedPointIndex}
            />
            <div className='flex'>
                <p className='font-main font-bold text-xl flex-1 '>Планировщик путешествий</p>
                {id ?

                    <button onClick={handleUpdate} className='flex items-center justify-center gap-4 w-40 h-8 bg-[#94a56f] text-white font-main rounded-md'>
                        <FaSave size={20} color='white' />
                        <p>Изменить</p>
                    </button>
                    :
                    <button onClick={handleSave
                    } className='flex items-center justify-center gap-4 w-40 h-8 bg-[#94a56f] text-white font-main rounded-md'>
                        <FaSave size={20} color='white' />
                        <p>Сохранить</p>
                    </button>
                }

            </div>
            <div className='flex mt-5 gap-4'>
                <div className=' flex-[1_1_35%] flex flex-col gap-6 w-full h-full p-6 bg-white rounded-2xl shadow-[0px_10px_15px_-3px_rgba(0,_0,_0,_0.1)]'>
                    <p className='font-bold font-main text-xl'>Информация о поездке</p>
                    <div className='flex flex-col gap-3.5'>
                        <CustomInput value={title} handleChange={setTitle} label={`Название поездки`} placeholder={`Новая поездка`} type={`text`} />
                        <div className='flex flex-col gap-1.5'>
                            <label className='font-main text-black'>Дата</label>
                            <div className='w-full bg-[#f6f7fe] h-12 flex justify-center items-center px-3 border-1 border-[#d9d9d9] rounded-2xl'>
                                <input value={dateState} onChange={(e) => setDateState(e.target.value)} className='text-black w-full appearance-none outline-none border-none bg-transparent p-0 m-0 font-inherit ' type={`date`} />
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col gap-3.5'>
                        <div className='flex'>
                            <p className='flex-1 font-main'>Точки маршрута</p>
                            <button onClick={() => setIsAdding(true)} className='text-[#94a56f]'>+ Добавить точку</button>
                        </div>
                        <div className='w-full rounded-2xl bg-gray-100 p-4'>

                            {isAdding && (
                                <div className='relative mb-3'>
                                    <input
                                        type='text'
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        className='w-full p-2 border rounded'
                                        placeholder='Введите название места'
                                    />
                                    {/* Список подсказок */}
                                    {suggestions.length > 0 && (
                                        <ul className='absolute z-10 w-full bg-white border rounded mt-1'>
                                            {suggestions.map((suggestion, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                    className='p-2 hover:bg-gray-100 cursor-pointer'
                                                >
                                                    {suggestion.name} ({suggestion.display_name})
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {/* Кнопка "Сохранить" для новой точки */}
                                    <button
                                        onClick={savePoint}
                                        className='mt-2 px-4 py-2 bg-[#94a56f] text-white rounded'
                                    >
                                        Сохранить
                                    </button>
                                    {/* Кнопка "Отмена" */}
                                    <button
                                        onClick={() => {
                                            setInputValue('');
                                            setSuggestions([]);
                                            setIsAdding(false);
                                        }}
                                        className='mt-2 ml-2 px-4 py-2 bg-gray-500 text-white rounded'
                                    >
                                        Отмена
                                    </button>
                                </div>
                            )}

                            {/* Список добавленных точек */}
                            {points.map((point, index) => (
                                <div key={index} className='mb-3 bg-white rounded-xl p-6 relative'>

                                    {/* Кнопки перемещения - рендерим только для точек, которые можно перемещать */}
                                    {index !== 0 && (
                                        <div className="absolute top-3 right-3 flex flex-col space-y-2">
                                            {/* Кнопка вверх - скрываем для точки сразу после начальной */}
                                            <button
                                                onClick={() => movePointUp(index)}
                                                disabled={index === 1} // Запрещаем перемещать перед первой точкой
                                                className={`p-1 rounded-full ${index === 1 ?
                                                    'text-gray-300 cursor-default' :
                                                    'text-gray-500 hover:text-white hover:bg-[#94a56f] transition-colors'}`}
                                                title={index === 1 ? "Нельзя переместить перед начальную точку" : "Переместить вверх"}
                                            >
                                                <FaArrowUp scale={20} />
                                            </button>

                                            {/* Кнопка вниз - скрываем для последней точки */}
                                            <button
                                                onClick={() => movePointDown(index)}
                                                disabled={index === points.length - 1}
                                                className={`p-1 rounded-full ${index === points.length - 1 ?
                                                    'text-gray-300 cursor-default' :
                                                    'text-gray-500 hover:text-white hover:bg-[#94a56f] transition-colors'}`}
                                                title={index === points.length - 1 ? "Это последняя точка" : "Переместить вниз"}
                                            >
                                                <FaArrowDown scale={20} />
                                            </button>
                                        </div>
                                    )}

                                    <div className='flex flex-col gap-4'>

                                        <div className='flex gap-2'>
                                            <p className='font-main font-bold  text-[1rem]'>Название:</p>
                                            <p className='font-main font-medium text-[1rem]'>{point.name}</p>
                                        </div>
                                        <div className='flex gap-2'>
                                            <p className='font-main font-bold text-[1rem]'>Адрес:</p>
                                            <p className='font-main font-medium text-[1rem]'>{point.address}</p>
                                        </div>
                                        {/* Поле для времени отправления или прибытия */}
                                        {index !== 0 && (
                                            <div className='mb-2'>
                                                <label className='block mb-1'>Тип точки:</label>
                                                <select
                                                    value={point.type || "attraction"}
                                                    onChange={(e) => updatePointType(index, e.target.value)}
                                                    className='w-full p-2 border rounded'
                                                >
                                                    {Object.entries(POINT_TYPES).map(([key, type]) => (
                                                        <option key={key} value={key}>{type.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        {index === 0 ? (
                                            <div className='mt-2'>
                                                <label className='font-main font-bold  text-[1rem]'>Время отправления:</label>
                                                <input
                                                    type='time'
                                                    value={point.departureTime || ''}
                                                    onChange={(e) => updateDepartureTime(index, e.target.value)}
                                                    className='ml-2 p-1 border rounded'
                                                />
                                            </div>
                                        ) : (
                                            <div className='mt-2'>
                                                <label className='font-main font-bold  text-[1rem]'>Время прибытия:</label>
                                                <input
                                                    type='text'
                                                    value={point.arrivalTime || 'Рассчитывается...'}
                                                    readOnly
                                                    className='ml-2 p-1 border rounded'
                                                />
                                            </div>
                                        )}
                                        {point.osmData?.opening_hours && (
                                            <div className="mt-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Часы работы:</span>
                                                    <span>{point.osmData.opening_hours}</span>
                                                </div>
                                                <TimeCheckInfo point={point} />
                                            </div>
                                        )}
                                        <div className='mt-3'>
                                            <label className='block mb-1'>Заметка:</label>
                                            <textarea
                                                value={point.note || ''}
                                                onChange={(e) => updatePointNote(index, e.target.value)}
                                                placeholder="Напишите заметку..."
                                                className='w-full p-2 border rounded'
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedPointIndex(index);
                                                setShowModal(true);
                                            }}
                                            className='px-4 py-2 bg-[#94a56f] text-white rounded'
                                        >
                                            Добавить фото
                                        </button>
                                        {point.photos && point.photos.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {point.photos.map((photo, photoIndex) => (
                                                    <div key={photo.id || photoIndex} className="relative">
                                                        <img
                                                            src={photo.preview} // Используем прямой URL с сервера
                                                            alt={`Фото ${photoIndex}`}
                                                            className="w-20 h-20 object-cover rounded"
                                                            onError={(e) => {
                                                                e.target.src = '/placeholder-image.jpg'; // Запасное изображение
                                                            }}
                                                        />
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeletePhoto(point.id, photo.id, index, photoIndex);
                                                            }}
                                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Кнопка "Удалить" для существующей точки */}
                                        <button
                                            onClick={() => deletePoint(index)}
                                            className='px-4 py-2 bg-red-500 text-white rounded'
                                        >
                                            Удалить
                                        </button>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {routeCalculations.inProgress && (
                    <div className="fixed top-4 right-4 bg-white p-3 shadow-lg rounded-lg">
                        <div className="flex items-center">
                            <div className="animate-spin mr-2">🔄</div>
                            <span>Расчет маршрута...</span>
                        </div>
                    </div>
                )}
                <div className='flex-[1_1_65%] w-full h-full p-6 bg-white rounded-2xl shadow-[0px_10px_15px_-3px_rgba(0,_0,_0,_0.1)] flex flex-col gap-6'>
                    <div className='h-full w-full p-4 py-7'>
                        {/* Остальной код */}
                        <div className='flex-[1_1_65%] w-full h-full p-6 bg-white rounded-2xl shadow-[0px_10px_15px_-3px_rgba(0,_0,_0,_0.1)] flex flex-col gap-6'>
                            <h2 className='font-bold font-main'>Карта маршрута</h2>
                            <div id="map-container" style={{ width: "100%", height: "500px", position: "relative" }}>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;