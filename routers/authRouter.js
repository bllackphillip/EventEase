// routers/authRouter.js
import express from "express";
import * as authCtrl from "../controllers/authController.js";

const router = express.Router();
router.post("/signup", authCtrl.signup);
router.get("/login", authCtrl.getLogin);
router.post("/login", authCtrl.login);
router.post("/logout", authCtrl.logout);
export default router;
