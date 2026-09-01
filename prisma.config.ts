import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations-postgres",
  },
  datasource: {
    url: process.env.STORAGE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? process.env.STORAGE_URL ?? "",
  },
});
