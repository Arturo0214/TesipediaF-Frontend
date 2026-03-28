import React, { useState, memo, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import worldData from 'world-atlas/countries-110m.json';
import {
  FaTimes, FaGlobe, FaUsers, FaUserPlus, FaSignInAlt,
  FaPercentage, FaMapMarkerAlt, FaChartLine,
} from 'react-icons/fa';

// Use locally imported TopoJSON (no network fetch needed)
const geoUrl = worldData;

const colorDomain = [0, 1, 10, 50, 100];
const colorRange = ['#eef2ff', '#c7d2fe', '#818cf8', '#4f46e5', '#312e81'];
const colorScale = scaleLinear().domain(colorDomain).range(colorRange).clamp(true);

// ISO 3166-1 Numeric → Alpha-2 mapping (world-atlas uses numeric IDs)
const numericToAlpha2 = {
  '004':'AF','008':'AL','012':'DZ','016':'AS','020':'AD','024':'AO','028':'AG','031':'AZ',
  '032':'AR','036':'AU','040':'AT','044':'BS','048':'BH','050':'BD','051':'AM','052':'BB',
  '056':'BE','060':'BM','064':'BT','068':'BO','070':'BA','072':'BW','076':'BR','084':'BZ',
  '090':'SB','096':'BN','100':'BG','104':'MM','108':'BI','112':'BY','116':'KH','120':'CM',
  '124':'CA','132':'CV','140':'CF','144':'LK','148':'TD','152':'CL','156':'CN','158':'TW',
  '170':'CO','174':'KM','178':'CG','180':'CD','184':'CK','188':'CR','191':'HR','192':'CU',
  '196':'CY','203':'CZ','204':'BJ','208':'DK','212':'DM','214':'DO','218':'EC','222':'SV',
  '226':'GQ','231':'ET','232':'ER','233':'EE','234':'FO','242':'FJ','246':'FI','250':'FR',
  '258':'PF','262':'DJ','266':'GA','268':'GE','270':'GM','275':'PS','276':'DE','288':'GH',
  '296':'KI','300':'GR','304':'GL','308':'GD','316':'GU','320':'GT','324':'GN','328':'GY',
  '332':'HT','340':'HN','344':'HK','348':'HU','352':'IS','356':'IN','360':'ID','364':'IR',
  '368':'IQ','372':'IE','376':'IL','380':'IT','384':'CI','388':'JM','392':'JP','398':'KZ',
  '400':'JO','404':'KE','408':'KP','410':'KR','414':'KW','417':'KG','418':'LA','422':'LB',
  '426':'LS','428':'LV','430':'LR','434':'LY','438':'LI','440':'LT','442':'LU','450':'MG',
  '454':'MW','458':'MY','462':'MV','466':'ML','470':'MT','478':'MR','480':'MU','484':'MX',
  '492':'MC','496':'MN','498':'MD','499':'ME','504':'MA','508':'MZ','512':'OM','516':'NA',
  '520':'NR','524':'NP','528':'NL','540':'NC','554':'NZ','558':'NI','562':'NE','566':'NG',
  '570':'NU','578':'NO','586':'PK','591':'PA','598':'PG','600':'PY','604':'PE','608':'PH',
  '616':'PL','620':'PT','624':'GW','626':'TL','630':'PR','634':'QA','642':'RO','643':'RU',
  '646':'RW','659':'KN','662':'LC','670':'VC','674':'SM','678':'ST','682':'SA','686':'SN',
  '688':'RS','690':'SC','694':'SL','702':'SG','703':'SK','704':'VN','705':'SI','706':'SO',
  '710':'ZA','716':'ZW','724':'ES','728':'SS','729':'SD','740':'SR','748':'SZ','752':'SE',
  '756':'CH','760':'SY','762':'TJ','764':'TH','768':'TG','776':'TO','780':'TT','784':'AE',
  '788':'TN','792':'TR','795':'TM','798':'TV','800':'UG','804':'UA','807':'MK','818':'EG',
  '826':'GB','834':'TZ','840':'US','854':'BF','858':'UY','860':'UZ','862':'VE','887':'YE',
  '894':'ZM',
};

// Alpha-2 → Country name in Spanish (for display)
const alpha2ToName = {
  'MX':'Mexico','US':'Estados Unidos','CA':'Canada','BR':'Brasil','AR':'Argentina',
  'CO':'Colombia','PE':'Peru','CL':'Chile','EC':'Ecuador','VE':'Venezuela',
  'GT':'Guatemala','HN':'Honduras','CR':'Costa Rica','PA':'Panama','NI':'Nicaragua',
  'SV':'El Salvador','DO':'Rep. Dominicana','CU':'Cuba','BO':'Bolivia','PY':'Paraguay',
  'UY':'Uruguay','GB':'Reino Unido','FR':'Francia','DE':'Alemania','ES':'Espana',
  'IT':'Italia','PT':'Portugal','NL':'Paises Bajos','BE':'Belgica','CH':'Suiza',
  'AT':'Austria','IE':'Irlanda','SE':'Suecia','NO':'Noruega','DK':'Dinamarca',
  'FI':'Finlandia','PL':'Polonia','CZ':'Rep. Checa','RO':'Rumania','HU':'Hungria',
  'GR':'Grecia','UA':'Ucrania','RU':'Rusia','CN':'China','JP':'Japon',
  'KR':'Corea del Sur','IN':'India','ID':'Indonesia','TH':'Tailandia','VN':'Vietnam',
  'PH':'Filipinas','MY':'Malasia','SG':'Singapur','TW':'Taiwan','AU':'Australia',
  'NZ':'Nueva Zelanda','ZA':'Sudafrica','NG':'Nigeria','EG':'Egipto','KE':'Kenia',
  'MA':'Marruecos','SA':'Arabia Saudita','TR':'Turquia','IL':'Israel','AE':'Emiratos Arabes',
  'CD':'Rep. Dem. Congo','CG':'Congo','TZ':'Tanzania','ET':'Etiopia',
};

// Name → Alpha-2 fallback
const nameToAlpha2 = {
  'Mexico':'MX','United States of America':'US','United States':'US','Canada':'CA',
  'Brazil':'BR','Argentina':'AR','Colombia':'CO','Peru':'PE','Chile':'CL',
  'Ecuador':'EC','Venezuela':'VE','Guatemala':'GT','Honduras':'HN','Costa Rica':'CR',
  'Panama':'PA','Nicaragua':'NI','El Salvador':'SV','Dominican Rep.':'DO',
  'Cuba':'CU','Bolivia':'BO','Paraguay':'PY','Uruguay':'UY',
  'United Kingdom':'GB','France':'FR','Germany':'DE','Spain':'ES','Italy':'IT',
  'Portugal':'PT','Netherlands':'NL','Belgium':'BE','Switzerland':'CH','Austria':'AT',
  'Ireland':'IE','Sweden':'SE','Norway':'NO','Denmark':'DK','Finland':'FI',
  'Poland':'PL','Czech Rep.':'CZ','Czechia':'CZ','Romania':'RO','Hungary':'HU',
  'Greece':'GR','Ukraine':'UA','Russia':'RU',
  'China':'CN','Japan':'JP','South Korea':'KR','India':'IN','Indonesia':'ID',
  'Thailand':'TH','Vietnam':'VN','Philippines':'PH','Malaysia':'MY','Singapore':'SG',
  'Taiwan':'TW','Australia':'AU','New Zealand':'NZ',
  'South Africa':'ZA','Nigeria':'NG','Egypt':'EG','Kenya':'KE','Morocco':'MA',
  'Saudi Arabia':'SA','Turkey':'TR','Israel':'IL','U.A.E.':'AE',
  'Dem. Rep. Congo':'CD','Congo':'CG','Tanzania':'TZ','Ethiopia':'ET',
};

// Also map GA country names (English) to alpha2
const gaNameToAlpha2 = {
  'Mexico':'MX','United States':'US','Canada':'CA','Brazil':'BR','Argentina':'AR',
  'Colombia':'CO','Peru':'PE','Chile':'CL','Ecuador':'EC','Venezuela':'VE',
  'Guatemala':'GT','Honduras':'HN','Costa Rica':'CR','Panama':'PA','Nicaragua':'NI',
  'El Salvador':'SV','Dominican Republic':'DO','Cuba':'CU','Bolivia':'BO','Paraguay':'PY',
  'Uruguay':'UY','United Kingdom':'GB','France':'FR','Germany':'DE','Spain':'ES',
  'Italy':'IT','Portugal':'PT','Netherlands':'NL','Belgium':'BE','Switzerland':'CH',
  'Austria':'AT','Ireland':'IE','Sweden':'SE','Norway':'NO','Denmark':'DK','Finland':'FI',
  'Poland':'PL','Czechia':'CZ','Romania':'RO','Hungary':'HU','Greece':'GR',
  'Ukraine':'UA','Russia':'RU','China':'CN','Japan':'JP','South Korea':'KR',
  'India':'IN','Indonesia':'ID','Thailand':'TH','Vietnam':'VN','Philippines':'PH',
  'Malaysia':'MY','Singapore':'SG','Taiwan':'TW','Australia':'AU','New Zealand':'NZ',
  'South Africa':'ZA','Nigeria':'NG','Egypt':'EG','Kenya':'KE','Morocco':'MA',
  'Saudi Arabia':'SA','Türkiye':'TR','Turkey':'TR','Israel':'IL','United Arab Emirates':'AE',
};

function getCountryISO2(geo) {
  const numId = geo.id || geo.properties?.id;
  if (numId && numericToAlpha2[String(numId)]) return numericToAlpha2[String(numId)];
  const a2 = geo.properties?.ISO_A2;
  if (a2 && a2 !== '-99') return a2;
  const name = geo.properties?.name || geo.properties?.ADMIN || geo.properties?.NAME;
  if (name && nameToAlpha2[name]) return nameToAlpha2[name];
  return null;
}

function getCountryName(geo) {
  return geo.properties?.name || geo.properties?.ADMIN || geo.properties?.NAME || 'Desconocido';
}

function getDisplayName(iso2, geoName) {
  return alpha2ToName[iso2] || geoName || 'Desconocido';
}

// Flag emoji from ISO alpha-2
function getFlag(iso2) {
  if (!iso2 || iso2.length !== 2) return '';
  return String.fromCodePoint(...[...iso2.toUpperCase()].map(c => 0x1f1e6 + c.charCodeAt(0) - 65));
}

// ── Country Detail Modal ──
function CountryModal({ data, onClose }) {
  if (!data) return null;

  const { name, iso2, visits, totalVisits, gaInfo } = data;
  const pct = totalVisits > 0 ? ((visits / totalVisits) * 100).toFixed(1) : '0.0';
  const flag = getFlag(iso2);

  return (
    <div className="vs-country-modal-overlay" onClick={onClose}>
      <div className="vs-country-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="vs-country-modal-header">
          <div className="vs-country-modal-title-row">
            <span className="vs-country-modal-flag">{flag}</span>
            <div>
              <h3 className="vs-country-modal-name">{name}</h3>
              <span className="vs-country-modal-code">{iso2}</span>
            </div>
          </div>
          <button className="vs-country-modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        {/* Stats Grid */}
        <div className="vs-country-modal-stats">
          <div className="vs-country-stat">
            <div className="vs-country-stat-icon blue"><FaGlobe /></div>
            <div className="vs-country-stat-info">
              <span className="vs-country-stat-value">{visits.toLocaleString()}</span>
              <span className="vs-country-stat-label">Visitas (registro)</span>
            </div>
          </div>
          <div className="vs-country-stat">
            <div className="vs-country-stat-icon purple"><FaPercentage /></div>
            <div className="vs-country-stat-info">
              <span className="vs-country-stat-value">{pct}%</span>
              <span className="vs-country-stat-label">Del total</span>
            </div>
          </div>
          {gaInfo && (
            <>
              <div className="vs-country-stat">
                <div className="vs-country-stat-icon green"><FaUsers /></div>
                <div className="vs-country-stat-info">
                  <span className="vs-country-stat-value">{(gaInfo.activeUsers || 0).toLocaleString()}</span>
                  <span className="vs-country-stat-label">Usuarios GA</span>
                </div>
              </div>
              <div className="vs-country-stat">
                <div className="vs-country-stat-icon teal"><FaUserPlus /></div>
                <div className="vs-country-stat-info">
                  <span className="vs-country-stat-value">{(gaInfo.newUsers || 0).toLocaleString()}</span>
                  <span className="vs-country-stat-label">Nuevos usuarios</span>
                </div>
              </div>
              <div className="vs-country-stat">
                <div className="vs-country-stat-icon orange"><FaSignInAlt /></div>
                <div className="vs-country-stat-info">
                  <span className="vs-country-stat-value">{(gaInfo.sessions || 0).toLocaleString()}</span>
                  <span className="vs-country-stat-label">Sesiones GA</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Visual bar showing percentage */}
        <div className="vs-country-modal-bar-section">
          <div className="vs-country-modal-bar-label">
            <span>Participacion sobre el total</span>
            <strong>{pct}%</strong>
          </div>
          <div className="vs-country-modal-bar-track">
            <div className="vs-country-modal-bar-fill" style={{ width: `${Math.min(parseFloat(pct), 100)}%` }} />
          </div>
        </div>

        {/* GA comparison if available */}
        {gaInfo && (
          <div className="vs-country-modal-ga-section">
            <h4 className="vs-country-modal-section-title"><FaChartLine /> Datos de Google Analytics</h4>
            <div className="vs-country-modal-ga-grid">
              <div className="vs-country-modal-ga-item">
                <span className="vs-ga-item-label">Usuarios activos</span>
                <span className="vs-ga-item-value">{(gaInfo.activeUsers || 0).toLocaleString()}</span>
              </div>
              <div className="vs-country-modal-ga-item">
                <span className="vs-ga-item-label">Nuevos usuarios</span>
                <span className="vs-ga-item-value">{(gaInfo.newUsers || 0).toLocaleString()}</span>
              </div>
              <div className="vs-country-modal-ga-item">
                <span className="vs-ga-item-label">Sesiones</span>
                <span className="vs-ga-item-value">{(gaInfo.sessions || 0).toLocaleString()}</span>
              </div>
              <div className="vs-country-modal-ga-item">
                <span className="vs-ga-item-label">Tasa de nuevos</span>
                <span className="vs-ga-item-value">
                  {gaInfo.activeUsers > 0
                    ? ((gaInfo.newUsers / gaInfo.activeUsers) * 100).toFixed(1) + '%'
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        )}

        {!gaInfo && visits === 0 && (
          <div className="vs-country-modal-empty">
            <FaMapMarkerAlt />
            <p>Sin datos registrados para este pais en el periodo seleccionado.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Map ──
const VisitsMap = memo(function VisitsMap({ visitsByCountry = {}, gaCountries = [] }) {
  const [tooltip, setTooltip] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const totalVisits = Object.values(visitsByCountry).reduce((a, b) => a + b, 0);

  // Build a lookup: alpha2 → GA data
  const gaLookup = {};
  if (gaCountries?.length) {
    gaCountries.forEach(c => {
      const iso = gaNameToAlpha2[c.country];
      if (iso) gaLookup[iso] = c;
    });
  }

  const handleCountryClick = useCallback((geo) => {
    const iso2 = getCountryISO2(geo);
    const geoName = getCountryName(geo);
    const visits = iso2 ? (visitsByCountry[iso2] || 0) : 0;
    const gaInfo = iso2 ? gaLookup[iso2] || null : null;

    setSelectedCountry({
      name: getDisplayName(iso2, geoName),
      iso2: iso2 || '??',
      visits,
      totalVisits,
      gaInfo,
    });
  }, [visitsByCountry, totalVisits, gaLookup]);

  return (
    <div className="vs-map-container">
      <div className="vs-map-header">
        <h5 className="vs-map-title">Mapa de Visitas por Pais</h5>
        <span className="vs-map-total">{totalVisits} visitas totales</span>
      </div>

      <div className="vs-map-wrapper">
        <ComposableMap
            projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
            width={800}
            height={380}
            style={{ width: '100%', height: 'auto' }}
          >
            <ZoomableGroup center={[0, 20]} zoom={1}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const iso2 = getCountryISO2(geo);
                    const visits = iso2 ? (visitsByCountry[iso2] || 0) : 0;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={visits > 0 ? colorScale(visits) : '#f1f5f9'}
                        stroke="#e2e8f0"
                        strokeWidth={0.4}
                        onClick={() => handleCountryClick(geo)}
                        onMouseEnter={() => {
                          setTooltip({ name: getCountryName(geo), visits, iso: iso2 });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          default: { outline: 'none' },
                          hover: { fill: visits > 0 ? '#6366f1' : '#cbd5e1', outline: 'none', cursor: 'pointer' },
                          pressed: { fill: '#4338ca', outline: 'none' },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
      </div>

      {/* Legend */}
      <div className="vs-map-legend">
        <span className="vs-map-legend-label">Visitas:</span>
        {colorDomain.map((val, idx) => (
          <span key={val} className="vs-map-legend-item">
            <span className="vs-map-legend-swatch" style={{ background: colorRange[idx] }} />
            <span className="vs-map-legend-text">{val}{idx < colorDomain.length - 1 ? `-${colorDomain[idx + 1]}` : '+'}</span>
          </span>
        ))}
      </div>

      <p className="vs-map-hint">Haz clic en un pais para ver mas detalles</p>

      {/* Hover Tooltip */}
      {tooltip && (
        <div className="vs-map-tooltip">
          <strong>{tooltip.name}</strong>
          {tooltip.iso && <span className="vs-map-tooltip-code">{tooltip.iso}</span>}
          <div className="vs-map-tooltip-visits">{tooltip.visits} visita{tooltip.visits !== 1 ? 's' : ''}</div>
        </div>
      )}

      {/* Country Detail Modal */}
      <CountryModal data={selectedCountry} onClose={() => setSelectedCountry(null)} />
    </div>
  );
});

export default VisitsMap;
