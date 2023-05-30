const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor} = require('../middleware');
const destinations = require('../controllers/destination');

router.get('/', catchAsync(destinations.index));

router.post('/', isLoggedIn, catchAsync(destinations.createDestinations));

router.get('/new', isLoggedIn, catchAsync(destinations.renderNewForm));

router.get('/:id', catchAsync(destinations.showDestinations));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(destinations.renderEditForm));

router.put('/:id', isLoggedIn, catchAsync(destinations.updateDestination));

router.delete('/:id', isLoggedIn, catchAsync(destinations.deleteDestination));

module.exports = router;