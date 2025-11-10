import express from "express";
import { createAccountWithInviteLink, getAllChild, updateChildAccount } from "../controllers/parentChildAuthManagement.js";


const router = express.Router();

router.post('/create', createAccountWithInviteLink)
router.get('/all', getAllChild)
router.patch('/update/:id', updateChildAccount)
// router.delete('/delete', deleteChildAccount)

export default router;