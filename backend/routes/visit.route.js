const express = require('express');
const router = express.Router();

const {
  createVisit,
  registerVisit,
  trackVisit,
  listVisits,
  getVisit,
  updateVisitStatus,
  checkInVisit,
  checkOutVisit,
  getVisitMetrics,
} = require('../controllers/visit.controller');
const requireAuth = require("../middleware/requireAuth");

router.post('/create', createVisit);
router.post('/register', registerVisit);
router.post('/track', trackVisit);
router.get('/', requireAuth, listVisits);
router.get('/metrics', requireAuth, getVisitMetrics);
router.get('/:visitId', requireAuth, getVisit);
router.patch('/:visitId/status', requireAuth, updateVisitStatus);
router.patch('/:visitId/check-in', requireAuth, checkInVisit);
router.patch('/:visitId/check-out', requireAuth, checkOutVisit);

module.exports = router;
