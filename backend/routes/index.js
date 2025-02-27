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
router.get("/getSystemRequests", checkCookie, DataController.getSystemRequests);
router.get(
  "/getRequests/:access_level",
  checkCookie,
  DataController.getRequests
);
router.get("/getAllSystems", checkCookie, DataController.getAllSystems);
router.get(
  "/getRequestButtonsStatus",
  checkCookie,
  DataController.getRequestButtonsStatus
);
router.get(
  "/getDatabaseColumns",
  checkCookie,
  DataController.getDatabaseColumns
);
router.get("/getAllUsers", checkCookie, DataController.getAllUsers);
router.get("/getRequestColumns", checkCookie, DataController.getRequestColumns);
router.get(
  "/getWattsonEmployee",
  checkCookie,
  DataController.getWattsonEmployee
);
router.get("/getColumnsData", checkCookie, DataController.getColumnsData);
router.get("/getFullRequest/:id", checkCookie, DataController.getFullRequest);

router.post("/login", DataController.login);
router.post("/sign_up", checkCookie, DataController.sign_up);
router.post("/logout", DataController.logout);
router.post("/info", DataController.info);
router.post("/getUser_info", checkCookie, DataController.getUser_info);
router.post("/getUser_email", checkCookie, DataController.getUser_email);
router.post("/add_device", checkCookie, DataController.add_device);
router.post("/getActions", checkCookie, DataController.getActions);
router.post("/addRequest", checkCookie, DataController.addRequest);
router.post("/createRequest", checkCookie, DataController.createRequest);
router.post("/addSystem", checkCookie, DataController.addSystem);
router.post(
  "/updateDatabaseColumn",
  checkCookie,
  DataController.updateDatabaseColumn
);
router.post(
  "/addDatabaseColumn",
  checkCookie,
  DataController.addDatabaseColumn
);
router.post("/createSystem", checkCookie, DataController.createSystem);

router.delete(
  "/delete_device/:device_uid",
  checkCookie,
  DataController.delete_device
);
router.delete(
  `/removeRequest/:id`,
  checkCookie,
  DataController.removeRequestFrom
);
router.delete(
  `/deleteRequest/:id/:system_name`,
  checkCookie,
  DataController.deleteRequest
);
router.delete(`/deleteSystem/:name`, checkCookie, DataController.deleteSystem);
router.delete(
  `/deleteDatabaseColumn/:column/:tableName`,
  checkCookie,
  DataController.deleteDatabaseColumn
);

router.put("/off_esp", checkCookie, DataController.off_esp);
router.put("/updateUser", checkCookie, DataController.updateUser);
router.put("/setAccessLevel", checkCookie, DataController.setAccessLevel);

module.exports = router;
