const express = require('express');
const router = express.Router();

const {
  createVisit,
  registerVisit,
  trackVisit,
  listVisits,
  getVisit,
  updateVisitStatus,
} = require('../controllers/visit.controller');
const requireAuth = require("../middleware/requireAuth");

router.post('/create', createVisit);
router.post('/register', registerVisit);
router.post('/track', trackVisit);
router.get('/', requireAuth, listVisits);
router.get('/:visitId', requireAuth, getVisit);
router.patch('/:visitId/status', requireAuth, updateVisitStatus);

module.exports = router;
