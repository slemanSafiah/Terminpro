const Exception = require('../../../utils/errorHandlers/Exception');
const handler = require('./handler');
const router = require('express').Router();
const validator = require('./validator');
/*********************************
 * @Router /api/private/template *
 *********************************/

router.post('/', validator.save, Exception.generalErrorHandler(handler.save));

router.put('/:id', validator.update, Exception.generalErrorHandler(handler.update));

router.delete('/:id', validator.paramId, Exception.generalErrorHandler(handler.delete));

router.get('/:id', validator.paramId, Exception.generalErrorHandler(handler.getById));

//router.get('/', handler.getByCriteria);

module.exports = router;
