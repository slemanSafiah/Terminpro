const handler = require('./handler');
const router = require('express').Router();

/*********************************
 * @Router /api/private/template *
 *********************************/

router.post('/', handler.save);

router.put('/:id', handler.update);

router.delete('/:id', handler.delete);

router.get('/:id', handler.getById);

router.get('/', handler.getByCriteria);

module.exports = router;
