import express from 'express';
import axios from 'axios';

const router = express.Router();

const API_BASE_URL = 'https://app.crossroads.ai/api/v2/';
const API_KEY = '7c68c616-a0d3-4c2e-a653-c649debfd541';

router.get('/', async (req, res) => {
  const { endpoint, campaignId } = req.query;

  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint is required' });
  }

  try {
    const url = `${API_BASE_URL}${endpoint}?key=${API_KEY}${
      campaignId ? `&campaign_ids=${campaignId}` : ''
    }`;

    const response = await axios.get(url);
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error in proxy:', error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { config } = req.body;
  if (!config) {
    return res.status(400).json({ error: 'Config body is required' });
  }

  res.status(200).json({ message: 'Config updated' });
});

export default router;
