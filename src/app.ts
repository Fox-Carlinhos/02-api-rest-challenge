import fastify from "fastify";
import cookie from "@fastify/cookie";
import { UsersRoutes } from "./routes/users";
import fastifyJwt from "@fastify/jwt";
import { env } from "./env";
import { MealsRoutes } from "./routes/meals";

export const app = fastify();

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: "refreshToken",
    signed: false,
  },
  sign: {
    expiresIn: "1h",
  },
});

app.register(cookie);
app.register(UsersRoutes, {
  prefix: "users",
});

app.register(MealsRoutes, {
  prefix: "meals",
});
