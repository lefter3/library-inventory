import { ActionType } from "@prisma/client";
import Joi from "joi";

export interface ActionsFilter 
    { type?: ActionType; userId?: number; returned?: boolean }

export const actionsFilterSchema = Joi.object({
    type: Joi.string().valid(...Object.values(ActionType)).optional(),
    userId: Joi.number().integer().optional(),
    returned: Joi.boolean().optional()
  });