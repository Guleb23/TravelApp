import { jest } from '@jest/globals';
import L from 'leaflet';

// Создаем мок-объект полилинии
const createMockPolyline = () => {
    const mockPolyline = {
        addTo: jest.fn().mockReturnThis(),
        bindPopup: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        bringToFront: jest.fn(),
        setStyle: jest.fn(),
    };
    return mockPolyline;
};

// Мокаем Leaflet
jest.mock('leaflet', () => ({
    map: jest.fn(() => ({
        setView: jest.fn(),
        removeLayer: jest.fn(),
    })),
    tileLayer: jest.fn(() => ({
        addTo: jest.fn().mockReturnThis(),
    })),
    marker: jest.fn(() => ({
        addTo: jest.fn().mockReturnThis(),
        bindPopup: jest.fn().mockReturnThis(),
    })),
    polyline: jest.fn(() => createMockPolyline()),
    divIcon: jest.fn(),
    latLngBounds: jest.fn(() => ({
        getBounds: jest.fn(),
    })),
}));

// Мокаем функцию drawRoute
const drawRoute = (coordinates, startPoint, endPoint, duration) => {
    if (!global.mapRef?.current || !coordinates || coordinates.length === 0) return null;

    const routeColor = global.getRandomBrightColor();
    const zIndexOffset = 1000 + (global.polylinesRef.current.length * 10);
    const latLngs = coordinates.map(coord => [coord[1], coord[0]]);

    const polyline = L.polyline(latLngs, {
        color: routeColor,
        weight: 5,
        opacity: 0.7,
        className: 'route-polyline',
        zIndexOffset: zIndexOffset
    }).addTo(global.mapRef.current);

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

    global.polylinesRef.current.push(polyline);
    return polyline;
};

describe('drawRoute', () => {
    let mapRef;
    let polylinesRef;
    let mockPolyline;

    beforeEach(() => {
        // Сбрасываем моки
        jest.clearAllMocks();

        // Инициализируем ссылки
        mapRef = { current: null };
        polylinesRef = { current: [] };

        // Создаем новый мок полилинии для каждого теста
        mockPolyline = createMockPolyline();
        L.polyline.mockReturnValue(mockPolyline);

        // Делаем ссылки доступными для функции drawRoute
        global.mapRef = mapRef;
        global.polylinesRef = polylinesRef;
    });

    it('не должен рисовать маршрут, если карта не инициализирована', () => {
        const coordinates = [[55.7522, 37.6156], [55.7532, 37.6256]];
        const startPoint = { name: 'Start', coordinates: { lat: 55.7522, lon: 37.6156 } };
        const endPoint = { name: 'End', coordinates: { lat: 55.7532, lon: 37.6256 } };
        const duration = 300;

        const result = drawRoute(coordinates, startPoint, endPoint, duration);
        expect(result).toBeNull();
        expect(L.polyline).not.toHaveBeenCalled();
    });

    it('не должен рисовать маршрут, если координаты пусты', () => {
        mapRef.current = L.map();
        const coordinates = [];
        const startPoint = { name: 'Start', coordinates: { lat: 55.7522, lon: 37.6156 } };
        const endPoint = { name: 'End', coordinates: { lat: 55.7532, lon: 37.6256 } };
        const duration = 300;

        const result = drawRoute(coordinates, startPoint, endPoint, duration);
        expect(result).toBeNull();
        expect(L.polyline).not.toHaveBeenCalled();
    });

    it('должен успешно нарисовать маршрут с корректными параметрами', () => {
        mapRef.current = L.map();
        const coordinates = [[55.7522, 37.6156], [55.7532, 37.6256]];
        const startPoint = { name: 'Start', coordinates: { lat: 55.7522, lon: 37.6156 } };
        const endPoint = { name: 'End', coordinates: { lat: 55.7532, lon: 37.6256 } };
        const duration = 300;

        const result = drawRoute(coordinates, startPoint, endPoint, duration);

        // Проверяем создание полилинии
        expect(L.polyline).toHaveBeenCalled();
        expect(mockPolyline.addTo).toHaveBeenCalledWith(mapRef.current);
        expect(mockPolyline.bindPopup).toHaveBeenCalled();
        expect(mockPolyline.on).toHaveBeenCalledTimes(2); // события mouseover и mouseout
    });

    it('должен добавить полилинию в polylinesRef', () => {
        mapRef.current = L.map();
        const coordinates = [[55.7522, 37.6156], [55.7532, 37.6256]];
        const startPoint = { name: 'Start', coordinates: { lat: 55.7522, lon: 37.6156 } };
        const endPoint = { name: 'End', coordinates: { lat: 55.7532, lon: 37.6256 } };
        const duration = 300;

        drawRoute(coordinates, startPoint, endPoint, duration);

        expect(polylinesRef.current.length).toBe(1);
        expect(polylinesRef.current[0]).toBe(mockPolyline);
    });

    it('должен создать всплывающее окно с корректной информацией', () => {
        mapRef.current = L.map();
        const coordinates = [[55.7522, 37.6156], [55.7532, 37.6256]];
        const startPoint = { name: 'Start', coordinates: { lat: 55.7522, lon: 37.6156 } };
        const endPoint = { name: 'End', coordinates: { lat: 55.7532, lon: 37.6256 } };
        const duration = 300;

        drawRoute(coordinates, startPoint, endPoint, duration);

        const expectedPopupContent = `
      <div class="route-popup">
        <strong>Start → End</strong><br>
        Время в пути: 5 мин
      </div>
    `;

        expect(mockPolyline.bindPopup).toHaveBeenCalledWith(expectedPopupContent);
    });
}); 