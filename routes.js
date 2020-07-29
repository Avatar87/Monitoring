var router = require('express').Router();
var controllers = require('./controllers/appcontrollers');

router.all('/dashboard', controllers.authenticate);
router.get('/dashboard', controllers.renderDashboard);
router.get('/auth', controllers.renderAuth);
router.post('/auth', controllers.authController);
router.get('/api/grouplist', controllers.groupListController);
router.get('/api/groups', controllers.groupsController);
router.get('/api/groupdays', controllers.groupDaysController);
router.post('/api/date', controllers.dateController);

module.exports = router;