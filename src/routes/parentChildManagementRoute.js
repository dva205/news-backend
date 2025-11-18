import express from "express";
import { createAccountWithInviteLink, getAllChild, updateChildAccount, setChildStrict, getChildActivity } from "../controllers/parentChildManagementController.js";

const router = express.Router();

router.post('/create', createAccountWithInviteLink)
router.get('/all', getAllChild)
router.patch('/update/:id', updateChildAccount)
router.post('/set-strict/:id', setChildStrict)
router.post('/view-log/:id', getChildActivity)
// router.delete('/delete', deleteChildAccount)

export default router;