import express from 'express';
import * as scraperController from '../controllers/scraper.controller.js';
const router = express.Router();

// Allow GET (query params) and POST (JSON body) for convenience
router.get('/', scraperController.scrape);
router.post('/', scraperController.scrape);

export default router;