import axiosWithAuth from '../utils/axioswithAuth';

/**
 * Fetch all GA4 data in a single call (recommended)
 * @param {number} days - Period in days (default 7)
 */
export const getGADashboard = async (days = 7) => {
  const res = await axiosWithAuth.get(`/ga/dashboard?days=${days}`);
  return res.data;
};

export const getGARealtime = async () => {
  const res = await axiosWithAuth.get(`/ga/realtime`);
  return res.data;
};

export const getGAOverview = async (days = 28) => {
  const res = await axiosWithAuth.get(`/ga/overview?days=${days}`);
  return res.data;
};

export const getGATimeline = async (days = 30) => {
  const res = await axiosWithAuth.get(`/ga/timeline?days=${days}`);
  return res.data;
};
