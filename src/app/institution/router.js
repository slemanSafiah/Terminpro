const handler = require('./handler');
const router = require('express').Router();
const Exception = require('../../../utils/errorHandlers/Exception');
const validator = require('./validator');
const { auth } = require('../../../utils/token/authMiddleware');

/*********************************
 * @Router /api/private/template *
 *********************************/

router.post('/', auth, validator.save, Exception.generalErrorHandler(handler.save));

router.put('/:id', auth, validator.update, Exception.generalErrorHandler(handler.update));

router.put('/:id/rate', auth, validator.rate, Exception.generalErrorHandler(handler.rate));

router.put('/:id/photo', auth, validator.paramId, Exception.generalErrorHandler(handler.update));

router.delete('/:id', auth, validator.paramId, Exception.generalErrorHandler(handler.delete));

router.get('/:id', validator.paramId, Exception.generalErrorHandler(handler.getById));

router.get('/', validator.getByCriteria, handler.getByCriteria);

module.exports = router;
