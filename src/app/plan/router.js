const handler = require('./handler');
const router = require('express').Router();
const Exception = require('../../../utils/errorHandlers/Exception');
const validator = require('./validator');
const { auth } = require('../../../utils/token/authMiddleware');

/*********************************
 * @Router /api/private/template *
 *********************************/

router.post('/', auth, Exception.generalErrorHandler(handler.addPlan));

router.put('/:id', auth, Exception.generalErrorHandler(handler.updatePlan));

router.put('/:id/toggle', auth, Exception.generalErrorHandler(handler.switchStatus));

router.delete('/:id', auth, Exception.generalErrorHandler(handler.deletePlan));

router.get('/:id', Exception.generalErrorHandler(handler.getPlan));

router.get('/', Exception.generalErrorHandler(handler.getAllPlans));

module.exports = router;
