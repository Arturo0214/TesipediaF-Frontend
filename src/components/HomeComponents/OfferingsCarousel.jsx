import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import {
  FaFileAlt, FaPenFancy, FaUserTie, FaSearch, FaRobot, FaBookOpen,
  FaFlask, FaChartBar, FaNewspaper, FaChalkboardTeacher, FaListOl, FaArrowRight,
} from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './OfferingsCarousel.css';

const offerings = [
  { icon: <FaFileAlt />, t: 'Tesis completa', d: 'Desarrollo de inicio a fin: tema, capítulos, resultados y conclusiones.', to: '/comprar-tesis' },
  { icon: <FaPenFancy />, t: 'Corrección y estilo', d: 'Revisamos, corregimos y pulimos tu trabajo existente con rigor académico.', to: '/cuanto-cuesta-una-tesis' },
  { icon: <FaUserTie />, t: 'Asesoría y acompañamiento', d: 'Un asesor con posgrado te guía paso a paso hasta tu titulación.', to: '/asesoria-tesis' },
  { icon: <FaSearch />, t: 'Antiplagio Turnitin', d: 'Reporte de originalidad incluido. Tu tesis pasa los filtros de tu universidad.', to: '/comprar-tesis' },
  { icon: <FaRobot />, t: 'Detección anti-IA', d: '100% humano. Pasamos los detectores de inteligencia artificial más exigentes.', to: '/comprar-tesis' },
  { icon: <FaBookOpen />, t: 'Marco teórico', d: 'Estado del arte sólido con fuentes actualizadas y citación correcta.', to: '/ayuda-con-tesis' },
  { icon: <FaFlask />, t: 'Metodología', d: 'Diseño de investigación coherente: enfoque, instrumentos y procedimientos.', to: '/ayuda-con-tesis' },
  { icon: <FaChartBar />, t: 'Análisis de datos', d: 'Estadística en SPSS, R o Excel, con interpretación clara de resultados.', to: '/ayuda-con-tesis' },
  { icon: <FaNewspaper />, t: 'Artículos científicos', d: 'Redacción de papers y artículos para publicación indexada.', to: '/tesis-doctoral' },
  { icon: <FaChalkboardTeacher />, t: 'Preparación de defensa', d: 'Te preparamos para tu examen profesional con seguridad y argumentos.', to: '/comprar-tesis' },
  { icon: <FaListOl />, t: 'Formato APA / Vancouver', d: 'Formato, referencias y normas según los lineamientos de tu institución.', to: '/ayuda-con-tesis' },
];

const OfferingsCarousel = () => {
  return (
    <section className="oc-section" id="servicios">
      <div className="oc-head" data-aos="fade-up">
        <span className="oc-eyebrow">Servicios</span>
        <h2>Todo lo que podemos hacer por tu tesis</h2>
        <p>De la primera idea a tu titulación: elige justo lo que necesitas.</p>
      </div>

      <Swiper
        className="oc-swiper"
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={20}
        slidesPerView={1.15}
        centeredSlides={false}
        grabCursor
        loop
        autoplay={{ delay: 2800, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true }}
        navigation
        breakpoints={{
          560: { slidesPerView: 2 },
          900: { slidesPerView: 3 },
          1200: { slidesPerView: 4 },
        }}
      >
        {offerings.map((o, i) => (
          <SwiperSlide key={i}>
            <Link to={o.to} className="oc-card">
              <span className="oc-ico">{o.icon}</span>
              <h3>{o.t}</h3>
              <p>{o.d}</p>
              <span className="oc-more">Ver más <FaArrowRight /></span>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default OfferingsCarousel;
