const handler = require('./handler');
const router = require('express').Router();
const Exception = require('../../../utils/errorHandlers/Exception');

/*********************************
 * @Router /api/private/template *
 *********************************/

router.post('/', Exception.generalErrorHandler(handler.save));

router.put('/:id', Exception.generalErrorHandler(handler.update));

router.put('/:id/photo', Exception.generalErrorHandler(handler.updatePhoto));

router.put('/:id/verify', Exception.generalErrorHandler(handler.verify));

router.delete('/:id/photo', Exception.generalErrorHandler(handler.deletePhoto));

router.delete('/:id', Exception.generalErrorHandler(handler.delete));

router.get('/:id', Exception.generalErrorHandler(handler.getById));

router.get('/', Exception.generalErrorHandler(handler.getByCriteria));

router.post('/signup', Exception.generalErrorHandler(handler.signup));

router.post('/login', Exception.generalErrorHandler(handler.login));

module.exports = router;
