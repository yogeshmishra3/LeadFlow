import React from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

const GlobalSalesMap = () => {
    const salesData = {
        USA: 81,
        UK: 68,
        Australia: 48,
        Germany: 32,
    };

    return (
        <div className="global-sales-map">
            <h3>Top Global Sales</h3>
            <ComposableMap projection="geoMercator" width={800} height={400}>
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            const countryName = geo.properties.name;
                            const salesPercentage = salesData[countryName];

                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill={salesPercentage ? `rgba(0, 255, 0, ${salesPercentage / 100})` : "#f0f0f0"}
                                    stroke="#fff"
                                    strokeWidth={0.5}
                                />
                            );
                        })
                    }
                </Geographies>
            </ComposableMap>
        </div>
    );
};

export default GlobalSalesMap;
