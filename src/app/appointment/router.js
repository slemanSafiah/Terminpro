const handler = require('./handler');
const router = require('express').Router();
const Exception = require('../../../utils/errorHandlers/Exception');
/*********************************
 * @Router /api/private/template *
 *********************************/

router.post('/', Exception.generalErrorHandler(handler.save));

router.put('/:id', Exception.generalErrorHandler(handler.update));

router.put('/:id/rate', Exception.generalErrorHandler(handler.rate));

router.put('/:id/photo', Exception.generalErrorHandler(handler.update));

router.delete('/:id', Exception.generalErrorHandler(handler.delete));

router.get('/:id', Exception.generalErrorHandler(handler.getById));

// router.get('/', handler.getByCriteria);

module.exports = router;
