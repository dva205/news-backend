import express from "express";
import { createAccountWithInviteLink, getAllChild, updateChildAccount, setChildStrict } from "../controllers/parentChildManagement.js";

const router = express.Router();

router.post('/create', createAccountWithInviteLink)
router.get('/all', getAllChild)
router.patch('/update/:id', updateChildAccount)
router.post('/set-strict/:id', setChildStrict)
// router.delete('/delete', deleteChildAccount)

export default router;