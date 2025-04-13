import React, { useState, useEffect } from 'react';
import { FaSearch, FaShare, FaHeart, FaRegHeart, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
const FeedPage = () => {
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);
    const [allTags, setAllTags] = useState([]);
    const [likedPosts, setLikedPosts] = useState(new Set());
    const [expandedPosts, setExpandedPosts] = useState(new Set());
    // Загрузка данных
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const params = {
                    page,
                    search: searchQuery,
                    tag: selectedTag
                };

                const response = await axios.get('https://guleb23-apifortravel-a985.twc1.net/api/feed', { params });
                setFeed(response.data.items);
                setTotalPages(response.data.totalPages);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching feed:', error);
                setLoading(false);
            }
        };

        const fetchTags = async () => {
            try {
                const response = await axios.get('https://guleb23-apifortravel-a985.twc1.net/api/tags');
                setAllTags(response.data);
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };

        fetchData();
        fetchTags();
    }, [page, searchQuery, selectedTag]);
    const toggleExpand = (postId) => {
        setExpandedPosts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });
    };
    // Обработчики событий
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
    };
    //Записываем выбранный тег
    const handleTagClick = (tag) => {
        setSelectedTag(tag === selectedTag ? null : tag);
        setPage(1);
    };

    const handleLike = async (postId) => {
        try {
            if (likedPosts.has(postId)) {
                await axios.delete(`https://guleb23-apifortravel-a985.twc1.net/api/posts/${postId}/like`);
                setLikedPosts(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(postId);
                    return newSet;
                });
            } else {
                await axios.post(`https://guleb23-apifortravel-a985.twc1.net/api/posts/${postId}/like`);
                setLikedPosts(prev => new Set(prev).add(postId));
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleShare = (postId) => {
        console.log('Sharing post:', postId);
        navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
        alert('Ссылка скопирована в буфер обмена!');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Заголовок и поиск */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Лента путешествий</h1>
                    <p className="text-gray-600">Откройте для себя новые маршруты и идеи</p>
                </div>

                {/* Поиск и фильтры */}
                <div className="mb-8">
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="relative flex">
                            <input
                                type="text"
                                placeholder="Поиск по названиям..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-[#94a56f] focus:border-[#94a56f] outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="bg-[#94a56f] text-white px-4 py-2 rounded-r-lg hover:bg-[#7a8a5c] transition-colors"
                            >
                                <FaSearch />
                            </button>
                        </div>
                    </form>

                    {/* Теги */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => handleTagClick(tag)}
                                className={`px-3 py-1 rounded-full text-sm ${tag === selectedTag
                                    ? 'bg-[#94a56f] text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    } transition-colors`}
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="text-sm text-gray-500 text-center mb-4">
                    Страница {page} из {totalPages}
                </div>
                {/* Контент */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#94a56f]"></div>
                    </div>
                ) : feed.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500">Ничего не найдено. Попробуйте изменить параметры поиска.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {feed.map(post => (
                            <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                {/* Заголовок */}
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2
                                                className="text-xl font-semibold text-gray-800 hover:text-[#94a56f] cursor-pointer"

                                            >
                                                {post.title}
                                            </h2>
                                            <p className="text-gray-600">Автор: {post.user.username}</p>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <FaCalendarAlt className="mr-1" />
                                            {new Date(post.date).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Теги */}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {post.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded cursor-pointer hover:bg-gray-200"
                                                    onClick={() => handleTagClick(tag)}
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 overflow-hidden">
                                    {/* Первые 3 точки — всегда видимы */}
                                    {post.points.slice(0, 3).map(point => (
                                        <div key={point.id} className="mb-3 last:mb-0">
                                            <div className="flex justify-between">
                                                <h3 className="font-medium text-gray-800">{point.name}</h3>
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    {point.type}
                                                </span>
                                            </div>
                                            {point.address && (
                                                <p className="text-sm text-gray-600">{point.address}</p>
                                            )}
                                            {point.photos && point.photos.length > 0 && (
                                                <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                                                    {point.photos.slice(0, 3).map(photo => (
                                                        <img
                                                            key={photo.id}
                                                            src={`https://guleb23-apifortravel-a985.twc1.net/${photo.filePath}`}
                                                            alt={point.name}
                                                            className="h-24 rounded-md object-cover shadow-sm"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Анимация оставшихся точек */}
                                    <AnimatePresence>
                                        {expandedPosts.has(post.id) && (
                                            <motion.div
                                                initial={{ opacity: 0, scaleY: 0, transformOrigin: 'top' }}
                                                animate={{ opacity: 1, scaleY: 1 }}
                                                exit={{ opacity: 0, scaleY: 0 }}
                                                transition={{ duration: 0.4, ease: 'easeInOut' }}
                                                className="mt-3 origin-top"
                                            >
                                                {post.points.slice(3).map(point => (
                                                    <div key={point.id} className="mb-3 last:mb-0">
                                                        <div className="flex justify-between">
                                                            <h3 className="font-medium text-gray-800">{point.name}</h3>
                                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                {point.type}
                                                            </span>
                                                        </div>
                                                        {point.address && (
                                                            <p className="text-sm text-gray-600">{point.address}</p>
                                                        )}
                                                        {point.photos && point.photos.length > 0 && (
                                                            <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                                                                {point.photos.slice(0, 3).map(photo => (
                                                                    <img
                                                                        key={photo.id}
                                                                        src={`https://guleb23-apifortravel-a985.twc1.net/${photo.filePath}`}
                                                                        alt={point.name}
                                                                        className="h-24 rounded-md object-cover shadow-sm"
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Показ количества скрытых точек */}
                                    {!expandedPosts.has(post.id) && post.points.length > 3 && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            + еще {post.points.length - 3} точек маршрута...
                                        </p>
                                    )}
                                </div>

                                {/* Действия */}
                                <div className="p-3 bg-gray-50 flex justify-between items-center">
                                    <button
                                        onClick={() => handleLike(post.id)}
                                        className="flex items-center text-gray-500 hover:text-red-500"
                                    >
                                        {likedPosts.has(post.id) ? (
                                            <FaHeart className="text-red-500 mr-1" />
                                        ) : (
                                            <FaRegHeart className="mr-1" />
                                        )}
                                        <span>Нравится</span>
                                    </button>

                                    <button
                                        onClick={() => handleShare(post.id)}
                                        className="flex items-center text-gray-500 hover:text-[#94a56f]"
                                    >
                                        <FaShare className="mr-1" />
                                        <span>Поделиться</span>
                                    </button>
                                    <button
                                        onClick={() => toggleExpand(post.id)}
                                        className="text-[#94a56f] hover:underline"
                                    >
                                        {expandedPosts.has(post.id) ? 'Скрыть' : 'Подробнее'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Пагинация */}
                {totalPages > 1 && (
                    <div className="mt-10 flex justify-center">
                        <nav className="inline-flex items-center gap-1 rounded-md shadow-sm">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                            >
                                Назад
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => {
                                    // Показываем только 5 страниц: текущую, 2 до и 2 после
                                    return p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2);
                                })
                                .map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`px-3 py-2 border border-gray-300 ${page === p
                                            ? 'bg-[#94a56f] text-white font-semibold'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                            >
                                Вперёд
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedPage;