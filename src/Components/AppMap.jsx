import { DirectionsRenderer, GoogleMap, Marker } from '@react-google-maps/api';
import React from 'react'

const AppMap = ({ points, routes }) => {
    const mapContainerStyle = {
        width: '100%',
        height: '400px',
    };

    const center = points.length > 0 ? points[0].position : { lat: 0, lng: 0 };

    return (
        <div className="mt-4 shadow-lg rounded-lg overflow-hidden">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={12}
                center={center}
            >
                {points.map((point, index) => (
                    <Marker key={index} position={point.position} label={`${index + 1}`} />
                ))}
                {routes.map((route, index) => (
                    <DirectionsRenderer key={index} directions={route} />
                ))}
            </GoogleMap>
        </div>
    );
};

export default AppMap
