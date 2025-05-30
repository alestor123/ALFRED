const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../logging/logs');

const scrapeKTUAnnouncements = async () => {
    try {
        const response = await axios.get('https://ktu.edu.in/Menu/announcements', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const announcements = [];

        $('.announcement-item').each((index, element) => {
            try {
                const title = $(element).find('.title').text().trim();
                const date = $(element).find('.date').text().trim();
                const content = $(element).find('.content').text().trim();
                const downloadLink = $(element).find('a.download-link').attr('href');

                if (title && date) {
                    announcements.push({
                        title,
                        date,
                        content,
                        downloadLink: downloadLink ? `https://ktu.edu.in${downloadLink}` : null
                    });
                }
            } catch (error) {
                logger.error(`Error parsing announcement ${index}: ${error.message}`);
            }
        });

        if (announcements.length === 0) {
            throw new Error('No announcements found on the page');
        }

        logger.info(`Successfully parsed ${announcements.length} announcements`);
        return announcements;

    } catch (error) {
        logger.error('Error scraping KTU announcements:', error.message);
        if (error.response) {
            logger.error(`Response status: ${error.response.status}`);
            logger.error(`Response headers: ${JSON.stringify(error.response.headers)}`);
        }
        throw error;
    }
};

// Cache the announcements for 15 minutes to avoid too many requests
let cachedAnnouncements = null;
let lastFetchTime = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

const getAnnouncements = async () => {
    const now = Date.now();
    if (cachedAnnouncements && lastFetchTime && (now - lastFetchTime < CACHE_DURATION)) {
        return cachedAnnouncements;
    }

    const announcements = await scrapeKTUAnnouncements();
    if (announcements.length > 0) {
        cachedAnnouncements = announcements;
        lastFetchTime = now;
    }
    return announcements;
};

module.exports = {
    scrapeKTUAnnouncements: getAnnouncements
}; 