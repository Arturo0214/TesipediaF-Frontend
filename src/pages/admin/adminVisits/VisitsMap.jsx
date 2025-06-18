import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

// GeoJSON mundial con ISO_A2
const geoUrl = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

const colorDomain = [0, 1, 10, 50, 100];
const colorRange = ["#e0e7ef", "#b3c6e0", "#6497c6", "#2366a8", "#08306b"];
const colorScale = scaleLinear().domain(colorDomain).range(colorRange);

// Mapeo extendido de nombres de país a ISO Alpha-2
const countryNameToISO = {
    'Mexico': 'MX', 'México': 'MX', 'Estados Unidos Mexicanos': 'MX',
    'United States': 'US', 'Estados Unidos': 'US', 'USA': 'US', 'EEUU': 'US',
    'Ireland': 'IE', 'Irlanda': 'IE',
    'Spain': 'ES', 'España': 'ES',
    'Argentina': 'AR', 'Brasil': 'BR', 'Brazil': 'BR',
    'Canada': 'CA', 'Canadá': 'CA',
    'United Kingdom': 'GB', 'Reino Unido': 'GB', 'UK': 'GB',
    'Germany': 'DE', 'Alemania': 'DE',
    'France': 'FR', 'Francia': 'FR',
    'China': 'CN', 'República Popular China': 'CN',
    'India': 'IN', 'Hindustan': 'IN',
    // ...agrega más según tus datos
};

function normalizeCountryCode(country, geo) {
    if (!country) return 'N/A';
    if (country.length === 2) return country.toUpperCase();
    if (country.length === 3 && geo && geo.properties.ISO_A3 === country.toUpperCase()) return geo.properties.ISO_A2;
    if (countryNameToISO[country]) return countryNameToISO[country];
    // Búsqueda parcial por nombre
    const found = Object.keys(countryNameToISO).find(key => country.toLowerCase().includes(key.toLowerCase()));
    if (found) return countryNameToISO[found];
    return country;
}

function VisitsMap({ visitsByCountry = {} }) {
    const [tooltip, setTooltip] = useState(null);

    // Debug: mostrar los datos recibidos
    console.log('visitsByCountry (prop):', visitsByCountry);

    const totalVisits = Object.values(visitsByCountry).reduce((a, b) => a + b, 0);

    return (
        <div style={{ width: '100%', height: '400px', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 16, position: 'relative' }}>
            <h5 style={{ marginBottom: 16 }}>Mapa de Visitas por País</h5>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>Total de visitas: {totalVisits}</div>
            <div style={{ flex: 1, width: '100%', minHeight: 350 }}>
                <ComposableMap projectionConfig={{ scale: 120 }} width={1000} height={400} style={{ width: '100%', height: '100%' }}>
                    <Geographies geography={geoUrl}>
                        {({ geographies }) => {
                            // Debug: mostrar los códigos ISO_A2 del mapa
                            console.log('Geographies:', geographies.map(geo => ({
                                name: geo.properties.ADMIN,
                                iso: geo.properties.ISO_A2
                            })));
                            return geographies.map(geo => {
                                const iso2 = geo.properties.ISO_A2;
                                const visits = visitsByCountry[iso2] || 0;
                                // Debug: mostrar el país y visitas
                                if (visits > 0) {
                                    console.log(`Pintando ${geo.properties.ADMIN} (${iso2}): ${visits} visitas`);
                                }
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={visits > 0 ? colorScale(visits) : '#F5F4F6'}
                                        stroke="#DDD"
                                        onMouseEnter={() => {
                                            setTooltip({
                                                name: geo.properties.ADMIN,
                                                visits
                                            });
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                        style={{
                                            default: { outline: 'none' },
                                            hover: { fill: '#2a6bbf', outline: 'none' },
                                            pressed: { outline: 'none' }
                                        }}
                                    />
                                );
                            });
                        }}
                    </Geographies>
                </ComposableMap>
            </div>
            {/* Leyenda de colores */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>Leyenda:</span>
                {colorDomain.map((val, idx) => (
                    <span key={val} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ display: 'inline-block', width: 18, height: 12, background: colorRange[idx], border: '1px solid #ccc', borderRadius: 2 }}></span>
                        <span style={{ fontSize: 12 }}>{val}{idx < colorDomain.length - 1 ? ' - ' + colorDomain[idx + 1] : '+'}</span>
                    </span>
                ))}
            </div>
            {tooltip && (
                <div style={{ position: 'absolute', background: '#fff', border: '1px solid #CCC', borderRadius: 6, padding: 8, left: 20, top: 20, zIndex: 10, pointerEvents: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <strong>{tooltip.name}</strong><br />
                    Visitas: {tooltip.visits}
                </div>
            )}
        </div>
    );
}

export default VisitsMap; 