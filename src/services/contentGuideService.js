import axiosWithAuth from '../utils/axioswithAuth';

// 📝 Loop de contenido/SEO: guías por carrera
const list = async () => (await axiosWithAuth.get('/content-guides')).data;
const generate = async () => (await axiosWithAuth.post('/content-guides/generate')).data;
const publish = async (id, publish = true) =>
  (await axiosWithAuth.patch(`/content-guides/${id}/publish`, { publish })).data;
const remove = async (id) => (await axiosWithAuth.delete(`/content-guides/${id}`)).data;

const contentGuideService = { list, generate, publish, remove };
export default contentGuideService;
