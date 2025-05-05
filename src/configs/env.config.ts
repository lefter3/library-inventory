import dotenv from 'dotenv';
dotenv.config();

const base = {
  emailFrom: process.env.EMAIL_FROM || 'no-reply@library.com',
  restockEmail: process.env.RESTOCK_EMAIL || 'management@library.com',
  managementEmail: process.env.MANAGEMENT_EMAIL || 'management@library.com',
  congratulationAmount: parseInt(process.env.CONGRATULATION_AMOUNT || "2000"),
  initialAmount: parseInt(process.env.INITIAL_AMOUNT || "100"),
  authHeader: process.env.AUTH_HEADER || 'x-user-email'
}

const production = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.PROD_DATABASE_URL,
  email: {}
};

const development = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DEV_DATABASE_URL,
  email:{}
};

const env = process.env.NODE_ENV === 'production' ? {...base, ...production} : {...base, ...development};

export default env;
