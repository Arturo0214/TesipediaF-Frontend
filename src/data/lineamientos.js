// Lineamientos de titulación por universidad (fichas GRATUITAS, SEO).
// Fuente: investigación verificada por universidad (Tesipedia-Guias/Universidades/*.md).
// Cada ficha es el imán gratuito; enlaza a la guía de paga (/guias/<guiaId>) y a la
// landing de asesoría (/<landingSlug>). NO es documento oficial: lleva fecha de consulta.
import unam from './lineamientos/titulacion-unam.json';
import ipn from './lineamientos/titulacion-ipn.json';
import uam from './lineamientos/titulacion-uam.json';
import udg from './lineamientos/titulacion-udg.json';
import uanl from './lineamientos/titulacion-uanl.json';
import buap from './lineamientos/titulacion-buap.json';
import uv from './lineamientos/titulacion-uv.json';
import uaemex from './lineamientos/titulacion-uaemex.json';
import tec from './lineamientos/titulacion-tec-monterrey.json';
import unitec from './lineamientos/titulacion-unitec.json';
import uvm from './lineamientos/titulacion-uvm.json';

export const LINEAMIENTOS = [unam, ipn, uam, udg, uanl, buap, uv, uaemex, tec, unitec, uvm];

export const getLineamientoBySlug = (slug) => LINEAMIENTOS.find((l) => l.lineSlug === slug) || null;
export const getLineamientoByLanding = (landingSlug) =>
  LINEAMIENTOS.find((l) => l.landingSlug === landingSlug) || null;
