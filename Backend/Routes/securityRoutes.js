import express from "express"
import { getSecurityLogs } from "../Controllers/securityController.js"

const router= express.Router()

router.get("/logs",getSecurityLogs)

export default router