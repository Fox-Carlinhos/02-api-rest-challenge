import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";

export async function UsersRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    console.log(`[${request.method} ${request.url}]`);
  });

  app.post("/", async (request, reply) => {
    const createUserSchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string().min(6),
    });

    const { name, email, password } = createUserSchema.parse(request.body);

    const password_hash = await hash(password, 6);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
      },
    });

    return {
      user,
    };
  });

  app.post("/login", async (request, reply) => {
    const loginUserSchema = z.object({
      email: z.string(),
      password: z.string().min(6),
    });

    const { email, password } = loginUserSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw Error("Invalid credentials error");
    }

    const doesPasswordMatches = compare(password, user.password_hash);

    if (!doesPasswordMatches) {
      throw Error("Invalid credentials error");
    }

    const token = await reply.jwtSign({
      sign: {
        sub: user.id,
      },
    });

    return {
      user,
      token,
    };
  });
}
