import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Keyboard, Autoplay } from 'swiper/modules';
import { FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa';
import { getGuia, getPaquete } from '../../data/guias';

import 'swiper/css';
import 'swiper/css/pagination';
import './GuiasCarousel.css';

/**
 * GuiasCarousel — carrusel de portadas reales estilo "elige tu plantilla"
 * (referencia: carrusel de CVs de Contratado): tarjeta central enfocada y con
 * CTA, laterales visibles y atenuadas, flechas + dots.
 * La imagen es la PORTADA REAL de cada guía (Cloudinary), con f_auto/q_auto.
 */

const IDS = [
  'apa-7', 'marco-teorico', 'metodologia', 'planteamiento', 'resultados',
  'defensa', 'vancouver', 'tesis-unam', 'tesis-derecho', 'paq-completo',
];

const getProductoLocal = (id) => getGuia(id) || getPaquete(id);

// Optimiza la entrega de Cloudinary sin tocar el asset original
const cdn = (url, w = 520) =>
  typeof url === 'string' ? url.replace('/image/upload/', `/image/upload/w_${w},f_auto,q_auto/`) : url;

function GuiasCarousel({ ctaLabel = 'Ver esta guía', ctaQuery = '', trackPrefix = 'home_guias_carousel' }) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const base = IDS.map(getProductoLocal).filter(Boolean);
  // Duplica las láminas si son pocas: garantiza que el loop infinito nunca se quede sin material.
  const productos = base.length < 14 ? [...base, ...base] : base;

  return (
    <div className="gcar">
      <button ref={prevRef} type="button" className="gcar-arrow gcar-arrow-prev" aria-label="Guía anterior">
        <FaChevronLeft />
      </button>
      <button ref={nextRef} type="button" className="gcar-arrow gcar-arrow-next" aria-label="Guía siguiente">
        <FaChevronRight />
      </button>

      <Swiper
        modules={[Navigation, Pagination, A11y, Keyboard, Autoplay]}
        centeredSlides
        loop
        loopAdditionalSlides={4}         /* buffer para que el loop nunca se quede sin láminas */
        grabCursor                       /* cursor de "agarre" + arrastre con mouse/trackpad */
        simulateTouch
        slideToClickedSlide              /* click en una lámina lateral → se centra en ella */
        keyboard={{ enabled: true }}
        autoplay={{ delay: 3200, disableOnInteraction: false }}
        slidesPerView={1.25}
        spaceBetween={18}
        speed={520}
        breakpoints={{
          560: { slidesPerView: 2.2, spaceBetween: 20 },
          900: { slidesPerView: 3.2, spaceBetween: 24 },
          1280: { slidesPerView: 4, spaceBetween: 26 },
        }}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation={{ prevEl: null, nextEl: null }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        onSwiper={(swiper) => { try { swiper.autoplay?.start(); } catch { /* noop */ } }}
        className="gcar-swiper"
      >
        {productos.map((p, i) => {
          const portada = p.pages?.[0]?.src;
          return (
            <SwiperSlide key={`${p.id}-${i}`} className="gcar-slide">
              <div className="gcar-card">
                <div className="gcar-cover">
                  {portada ? (
                    <img
                      src={cdn(portada)}
                      alt={`Portada — ${p.nombre}`}
                      loading="lazy"
                      width="360"
                      height="466"
                    />
                  ) : (
                    <div className="gcar-cover-fallback">{p.kicker}</div>
                  )}
                  <span className="gcar-chip">{p.kicker}</span>
                </div>
                <div className="gcar-info">
                  <strong>{p.nombre}</strong>
                  <b className="gcar-price">${p.precio} MXN</b>
                </div>
                {/* CTA solo interactivo en la slide activa (como Contratado) */}
                <Link
                  to={`/guias/${p.id}${ctaQuery}`}
                  className="gcar-cta"
                  data-track-cta={`${trackPrefix}_${p.id}`}
                  tabIndex={-1}
                >
                  {ctaLabel} <FaArrowRight />
                </Link>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

export default GuiasCarousel;
