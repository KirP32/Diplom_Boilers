const Router = require("express").Router;
const { DataController } = require("../controller/data_controller");

const checkCookie = require("../middleware/checkCookie.js");
const checkAuth = require("../middleware/checkAuth.js");
const router = new Router();

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

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
router.get("/workersNameList", checkCookie, DataController.workersNameList);
router.get(
  "/getTooltipEmployees",
  checkCookie,
  DataController.getTooltipEmployees
);
router.get(
  "/getRequestColumnsData/:stageName/:requestID",
  checkCookie,
  DataController.getRequestColumnsData
);
router.get("/getFreeName", checkCookie, DataController.getFreeName);
router.get(
  "/getUserAccessLevel",
  checkCookie,
  DataController.getUserAccessLevel
);
router.get("/getWorkerInfo", checkCookie, DataController.getWorkerInfo);
router.get(
  "/getServicePrices/:requestID",
  checkCookie,
  DataController.getServicePrices
);
router.get("/getGoods", checkCookie, DataController.getGoods);

router.get(
  "/getActualGoodsAndServices/:requestID",
  checkCookie,
  DataController.getActualGoodsAndServices
);
router.get(
  "/getFreeContractNumber",
  checkCookie,
  DataController.getFreeContractNumber
);
router.get(
  "/getRequestPhoto/:requestID",
  checkCookie,
  checkAuth,
  DataController.getRequestPhoto
);
router.get(
  "/getLatLon/:assigned_to/:id",
  checkCookie,
  DataController.getLatLon
);
router.get("/getRequestName", checkCookie, DataController.getRequestName);
router.get(
  "/getEquipmentData/:requestID",
  checkCookie,
  DataController.getEquipmentData
);

router.post("/login", DataController.login);
router.post("/sign_up", checkCookie, DataController.sign_up);
router.post("/logout", DataController.logout);
router.post("/info", DataController.info);
router.post("/getUser_info", checkCookie, DataController.getUser_info);
router.post("/getUser_email", checkCookie, DataController.getUser_email);
router.post("/add_device", checkCookie, DataController.add_device);
router.post("/getActions", checkCookie, DataController.getActions);
router.post("/addRequest", checkCookie, DataController.addRequest);
router.post(
  "/createRequest",
  checkCookie,
  upload.fields([
    { name: "defects", maxCount: 20 },
    { name: "nameplates", maxCount: 20 },
    { name: "report", maxCount: 20 },
    { name: "request", maxCount: 20 },
  ]),
  DataController.createRequest
);
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
router.post("/setNewWorker", checkCookie, DataController.setNewWorker);
router.post("/addRowData", checkCookie, DataController.addRowData);
router.post(
  "/updatePrices",
  checkCookie,
  upload.single("file"),
  DataController.updatePrices
);
router.post(
  "/updateCoefficient",
  checkCookie,
  DataController.updateCoefficient
);
router.post(
  "/InsertGoodsServices",
  checkCookie,
  DataController.InsertGoodsServices
);
router.post(
  "/uploadPhoto/:requestID",
  checkCookie,
  checkAuth,
  upload.array("files"),
  DataController.uploadPhoto
);
router.post(
  "/WorkerConfirmedData",
  checkCookie,
  DataController.WorkerConfirmedData
);
router.post(
  "/confirmEquipmentData",
  checkCookie,
  DataController.confirmEquipmentData
);
// router.post("/getGeoPosition", checkCookie, DataController.getGeoPosition);

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
router.delete(
  `/deleteRowData/:rowId/:tableName`,
  checkCookie,
  DataController.handleDeleteRow
);
router.delete(
  `/deleteRequestService/:requestID/:service_id`,
  checkCookie,
  DataController.handleDeleteService
);
router.delete(
  `/deleteRequestGood/:requestID/:good_id`,
  checkCookie,
  DataController.handleDeleteGood
);

router.delete(
  `/deletePhoto/:requestID/:id/:original_name`,
  checkCookie,
  checkAuth,
  DataController.deletePhoto
);

router.put("/off_esp", checkCookie, DataController.off_esp);
router.put("/updateUser", checkCookie, DataController.updateUser);
router.put("/setAccessLevel", checkCookie, DataController.setAccessLevel);
router.put(
  "/updateRequestColumn",
  checkCookie,
  DataController.updateRequestColumn
);
router.put("/updateRowData", checkCookie, DataController.updateRowData);

module.exports = router;
