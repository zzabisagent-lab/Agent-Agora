const searchService = require('../services/searchService');

async function search(req, res, next) {
  try {
    const result = await searchService.search(req.query);

    if (result.error_code) {
      return res.status(400).json({
        success: false,
        error_code: result.error_code,
        error_message: result.error_message,
      });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { search };
