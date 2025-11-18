import db from "../models/index.js";
import { ApiError } from '../utils/ApiError.js';

export const logTime = async (childId, activeSecond) => {
    const today = new Date().toISOString().split('T')[0];
    const data = await db.UsageLog.create({
        child_id: childId,
        active_seconds: activeSecond,
        session_date: today
    });

    return data;
};