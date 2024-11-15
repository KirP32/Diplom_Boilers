const Router = require('express').Router;
const dataController = require('../controller/data_controller');
const checkCookie = require('../middleware/checkCookie.js');

const router = new Router();

// router.get('/changes', dataController.changes);
router.get('/test', dataController.test);
router.get('/devices', checkCookie, dataController.devices);
router.get('/refresh', dataController.refresh);
router.get('/test_esp', checkCookie, dataController.test_esp);

router.post('/login', dataController.login);
router.post('/sign_up', checkCookie, dataController.sign_up);
router.post('/logout', dataController.logout);
router.post('/info', dataController.info);
router.post('/getUser_info', checkCookie, dataController.getUser_info);
router.post('/getUser_email', checkCookie, dataController.getUser_email);
router.post('/add_device', checkCookie, dataController.add_device);
router.post('/getActions', checkCookie, dataController.getActions);

router.delete('/delete_device/:device_uid', checkCookie, dataController.delete_device);

router.put('/off_esp', checkCookie, dataController.off_esp);

module.exports = router;