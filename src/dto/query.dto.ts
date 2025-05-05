import Joi from 'joi'


export interface PaginationParams {
    page: number;
    limit: number;
  }

export interface SearchBooks extends PaginationParams {
query?: string;
}

export const paginationSchema = Joi.object<PaginationParams>({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
})

export const searchSchema = paginationSchema.append<SearchBooks>({
    query: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
})
