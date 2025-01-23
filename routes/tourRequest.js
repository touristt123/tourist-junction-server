const express = require('express');
const router = express.Router();
const { handleGetUserByAuthToken, handleAuthorizeUserByRole } = require('../middlewares/auth');
const { handleGetAllTourRequests, handleCreateTourRequest } = require('../controllers/tourRequest');

router.post('/', handleGetUserByAuthToken, handleAuthorizeUserByRole(['CUSTOMER']), handleCreateTourRequest);
router.get('/', handleGetUserByAuthToken, handleAuthorizeUserByRole(['AGENCY']), handleGetAllTourRequests);

module.exports = router;