import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react'; // Основной компонент FullCalendar
import dayGridPlugin from '@fullcalendar/daygrid'; // Плагин для отображения месяца
import interactionPlugin from '@fullcalendar/interaction'; // Плагин для взаимодействия (нажатия, перетаскивания)
import '@fullcalendar/common/main.css'; // Основные стили
import CustomBtn from '../Components/CustomBtn'
import { useNavigate } from 'react-router';
import { FaCalendarDays } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { FaShare } from "react-icons/fa";


//const clickedDate = arg.date.toLocaleDateString().split('T')[0];

import axios from 'axios';
import { useAuth } from '../Context/AuthContext';
import ShareModal from '../Components/ShareModal';

const HomePage = () => {

    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(null);
    const [travels, setTravels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedTravelId, setSelectedTravelId] = useState(null);

    // Функция для открытия модального окна
    const handleShareClick = (travelId) => {
        setSelectedTravelId(travelId);
        setShowShareModal(true);
    };

    // Функция для отправки тегов на сервер
    const handleShareTravel = async (travelId, tags) => {
        try {
            await axios.put(`https://guleb23-webapplication2-c213.twc1.net/api/travels/${travelId}/share`, { tags });
            alert('Путешествие успешно опубликовано!');

            // Обновляем список путешествий
            const response = await axios.get(`https://guleb23-webapplication2-c213.twc1.net/api/routes/${user.id}`);
            setTravels(response.data);

            setShowShareModal(false);
        } catch (error) {
            console.error('Ошибка при публикации:', error);
            alert('Произошла ошибка при публикации');
        }
    };


    const formatDate = (date) => {
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .split('T')[0];
    };

    // Загрузка данных о путешествиях
    useEffect(() => {
        const fetchTravels = async () => {
            try {
                const response = await axios.get(`https://guleb23-webapplication2-c213.twc1.net/api/routes/${user.id}`);
                setTravels(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error('Ошибка при загрузке путешествий:', err);
            }
        };

        fetchTravels();
    }, []);

    // Преобразование данных для FullCalendar
    const calendarEvents = travels.map(travel => ({
        title: travel.title,
        date: formatDate(new Date(travel.date)),
        extendedProps: {
            travelId: travel.id,
            points: travel.points
        }
    }));



    const handleDateClick = (arg) => {
        const clickedDate = formatDate(new Date(arg.date));
        setSelectedDate(clickedDate);
    };

    const handleDelete = (id) => {
        axios.delete(`https://guleb23-webapplication2-c213.twc1.net/api/routes/${id}`)
            .then(() => {
                alert("Успешное удаление");
                // Обновляем состояние, удаляя удаленное путешествие
                setTravels(prevTravels => prevTravels.filter(travel => travel.id !== id));
            })
            .catch((e) => {
                console.log(e);
                alert("Ошибка при удалении");
            });
    };


    const handleBtnClick = () => {
        if (selectedDate) {
            navigate('/profile', { state: { date: selectedDate } });
        }
    };

    const dayCellClassNames = (arg) => {
        const cellDate = new Date(arg.date.getTime() - arg.date.getTimezoneOffset() * 60000)
            .toISOString()
            .split('T')[0];

        const baseClasses = ['hover:bg-gray-100, hover:opacity: 0.5'];

        if (selectedDate === cellDate) {
            baseClasses.push('bg-[#94a56f]', 'text-white');
        }

        const hasEvents = calendarEvents.some(event => event.date === cellDate);
        if (hasEvents) {
            baseClasses.push('has-events');
        }

        return baseClasses;
    };

    // Функция для отображения предстоящих поездок
    const renderUpcomingTravels = () => {
        if (loading) return <p className="p-4">Загрузка...</p>;
        if (error) return <p className="p-4 text-red-500">Ошибка: {error}</p>;
        if (travels.length === 0) return <p className="p-4">Нет предстоящих поездок</p>;

        return (
            <div className="p-4">
                {travels.map(travel => {
                    const formattedDate = formatDate(new Date(travel.date));

                    return (
                        <div
                            key={travel.id}
                            className="mb-4 p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer flex items-center"

                        >   <div className='flex-1' onClick={() => navigate(`/profile/${travel.id}`)}>
                                <h3 className="font-medium text-[#94a56f]">{travel.title}</h3>
                                <p className="text-sm text-gray-600">
                                    {new Date(formattedDate).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {travel.points?.length || 0} точек маршрута
                                </p>
                            </div>
                            <div className='w-16 flex flex-col gap-2'>
                                <CustomBtn customStyles={`  !bg-red-500`} icon={<MdDelete size={20} color='white' />} onClick={() => handleDelete(travel.id)} />
                                <CustomBtn
                                    customStyles={`!bg-[#94a56f]`}

                                    icon={<FaShare size={20} color='white' />}
                                    onClick={() => handleShareClick(travel.id)}
                                />
                            </div>

                        </div>
                    );
                })}
            </div>
        );
    };


    return (
        <div className="p-4 py-7 overflow-y-auto">
            {showShareModal && (
                <ShareModal
                    travelId={selectedTravelId}
                    onClose={() => setShowShareModal(false)}
                    onShare={handleShareTravel}
                />
            )}
            <h1 className='font-main text-2xl'>Ваш календарь путешествий</h1>
            <div className='flex gap-5'>
                <div className='flex flex-col flex-[1_1_65%]'>
                    <div className='bg-white p-7 w-full flex flex-col gap-10 mt-5 rounded-2xl shadow-[0px_10px_15px_-3px_rgba(0,_0,_0,_0.1)]'>
                        <div className='flex items-center gap-1'>
                            <FaCalendarDays color='#94a56f' size={35} />
                            <p className='font-main text-xl'>Календарь</p>
                        </div>

                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            dateClick={handleDateClick}
                            dayCellClassNames={dayCellClassNames}
                            height="500px"
                            headerToolbar={{
                                start: 'prev',
                                center: 'title',
                                end: 'next',
                            }}
                            events={calendarEvents}
                            eventContent={renderEventContent}
                        />

                        <div className='bg-[#F4F6F0] w-full p-6 flex flex-col gap-1 rounded-2xl'>
                            <p className='font-main text-[#94a56f] font-bold'>Выбранная дата</p>
                            {selectedDate && (
                                <p className='font-main text-[#94a56f] font-medium'>
                                    {new Date(selectedDate).toLocaleDateString()}
                                </p>
                            )}
                            <CustomBtn
                                onClick={handleBtnClick}
                                customStyles="bg-[#94a56f] !w-50 text-white"
                                text="Запланировать на эту дату"
                                disabled={!selectedDate}
                            />
                        </div>
                    </div>
                </div>

                <div className='flex-[1_1_35%] bg-white h-full mt-5 rounded-2xl shadow-[0px_10px_15px_-3px_rgba(0,_0,_0,_0.1)]'>
                    <p className='p-7 font-main text-xl'>Предстоящие поездки</p>
                    {renderUpcomingTravels()}
                </div>
            </div>
        </div>
    );
};

// Кастомное отображение событий в календаре
function renderEventContent(eventInfo) {
    return (
        <div className="fc-event-main-frame">
            <div className="fc-event-title-container">
                <div className="fc-event-title fc-sticky">
                    {eventInfo.event.title}
                </div>
            </div>
        </div>
    );
}

export default HomePage;