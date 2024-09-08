const express = require("express");

const router = express.Router();
const { createUser, getUser, getAllUser, getDestroy, loginUser, logoutUser } = require("../controller/userController")

router.route("/create").post(createUser);
router.route("/getData").get(getUser);
router.route("/getAllData").get(getAllUser);
router.route("/getDestroyData").delete(getDestroy);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);




module.exports = router;