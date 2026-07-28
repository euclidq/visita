const express = require('express');
const router = express.Router();

const {
  createVisit,
  registerVisit,
  trackVisit,
} = require('../controllers/visit.controller');

router.post('/create', createVisit);
router.post('/register', registerVisit);
router.post('/track', trackVisit);

module.exports = router;
