const handler = require('./handler');
const router = require('express').Router();
const Exception = require('../../../utils/errorHandlers/Exception');
const validator = require('./validator');
/*********************************
 * @Router /api/private/template *
 *********************************/

router.post('/', validator.save, Exception.generalErrorHandler(handler.save));

router.put('/:id', validator.update, Exception.generalErrorHandler(handler.update));

router.put('/:id/photo', validator.paramId, Exception.generalErrorHandler(handler.updatePhoto));

router.put('/:id/verify', validator.paramId, Exception.generalErrorHandler(handler.verify));

router.delete('/:id/photo', validator.paramId, Exception.generalErrorHandler(handler.deletePhoto));

router.delete('/:id', validator.paramId, Exception.generalErrorHandler(handler.delete));

router.get('/:id', validator.paramId, Exception.generalErrorHandler(handler.getById));

//router.get('/', Exception.generalErrorHandler(handler.getByCriteria));

router.post('/signup', validator.save, Exception.generalErrorHandler(handler.signup));

router.post('/login', validator.login, Exception.generalErrorHandler(handler.login));

module.exports = router;
