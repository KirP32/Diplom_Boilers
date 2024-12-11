const Router = require("express").Router;
const { DataController } = require("../controller/data_controller");

const checkCookie = require("../middleware/checkCookie.js");

const router = new Router();

// router.get('/changes', DataController.changes);
router.get("/test", DataController.test);
router.get("/devices", checkCookie, DataController.devices);
router.get("/refresh", DataController.refresh);
router.get("/test_esp", checkCookie, DataController.test_esp);
router.get("/getSystems", checkCookie, DataController.getSystems);

router.post("/login", DataController.login);
router.post("/sign_up", checkCookie, DataController.sign_up);
router.post("/logout", DataController.logout);
router.post("/info", DataController.info);
router.post("/getUser_info", checkCookie, DataController.getUser_info);
router.post("/getUser_email", checkCookie, DataController.getUser_email);
router.post("/add_device", checkCookie, DataController.add_device);
router.post("/getActions", checkCookie, DataController.getActions);

router.delete(
  "/delete_device/:device_uid",
  checkCookie,
  DataController.delete_device
);

router.put("/off_esp", checkCookie, DataController.off_esp);

module.exports = router;
