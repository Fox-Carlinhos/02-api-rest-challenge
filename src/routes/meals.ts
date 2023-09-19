import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { verifyJWT } from "@/middleware/verify-jwt";

export async function MealsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    console.log(`[${request.method} ${request.url}]`);
  });

  app.post("/", { onRequest: [verifyJWT] }, async (request, reply) => {
    const createMealSchema = z.object({
      name: z.string(),
      description: z.string(),
      dateTime: z.string(),
      isOnDiet: z.boolean(),
    });

    const { name, description, dateTime, isOnDiet } = createMealSchema.parse(request.body);

    const dateTimeParsed = new Date(dateTime);

    const meal = await prisma.meals.create({
      data: {
        name,
        description,
        date_time: dateTimeParsed,
        is_on_diet: isOnDiet,
        user_id: request.user.sign.sub,
      },
    });

    return reply.status(200).send({
      meal,
    });
  });

  app.get("/summary", { onRequest: [verifyJWT] }, async (request, reply) => {
    const userMeals = await prisma.meals.findMany({
      where: {
        user_id: request.user.sign.sub,
      },
      orderBy: {
        date_time: "desc",
      },
    });

    const quantiyOfMeals = userMeals.length;

    const quantityOfMealsOnDiet = userMeals.filter((meal) => meal.is_on_diet === true).length;

    const quantityOfMealsOutDiet = userMeals.filter((meal) => meal.is_on_diet === false).length;

    return reply.status(200).send({
      quantiyOfMeals,
      quantityOfMealsOnDiet,
      quantityOfMealsOutDiet,
    });
  });

  app.get("/", { onRequest: [verifyJWT] }, async (request, reply) => {
    const userMeals = await prisma.meals.findMany({
      where: {
        user_id: request.user.sign.sub,
      },
    });

    return reply.status(200).send({
      userMeals,
    });
  });

  app.get("/:id", { onRequest: [verifyJWT] }, async (request, reply) => {
    const getMealsParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getMealsParamsSchema.parse(request.params);

    const requestUserId = request.user.sign.sub;

    const userMeal = await prisma.meals.findUnique({
      where: {
        id,
      },
    });

    if (!userMeal) {
      throw new Error("This meal does not exist");
    }

    if (requestUserId !== userMeal.user_id) {
      return reply.status(403).send({
        message: "Unauthorized",
      });
    }

    return reply.status(200).send({
      userMeal,
    });
  });

  app.put("/:id", { onRequest: [verifyJWT] }, async (request, reply) => {
    const updateMealsParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const updateMealSchema = z.object({
      name: z.string(),
      description: z.string(),
      dateTime: z.string(),
      isOnDiet: z.boolean(),
    });

    const { id } = updateMealsParamsSchema.parse(request.params);

    const { name, description, dateTime, isOnDiet } = updateMealSchema.parse(request.body);

    const requestUserId = request.user.sign.sub;

    const userMeal = await prisma.meals.findUnique({
      where: {
        id,
      },
    });

    if (!userMeal) {
      throw new Error("This meal does not exist");
    }

    if (requestUserId !== userMeal.user_id) {
      return reply.status(403).send({
        message: "Unauthorized",
      });
    }

    const dateTimeParsed = new Date(dateTime);

    const updatedMeal = await prisma.meals.update({
      where: {
        id: userMeal.id,
      },
      data: {
        name,
        description,
        date_time: dateTimeParsed,
        is_on_diet: isOnDiet,
      },
    });

    return reply.status(200).send({
      updatedMeal,
    });
  });

  app.delete("/:id", { onRequest: [verifyJWT] }, async (request, reply) => {
    const deleteMealsParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = deleteMealsParamsSchema.parse(request.params);

    const requestUserId = request.user.sign.sub;

    const userMeal = await prisma.meals.findUnique({
      where: {
        id,
      },
    });

    if (!userMeal) {
      throw new Error("This meal does not exist");
    }

    if (requestUserId !== userMeal.user_id) {
      return reply.status(403).send({
        message: "Unauthorized",
      });
    }

    const deletedMeal = await prisma.meals.delete({
      where: {
        id: userMeal.id,
      },
    });

    return reply.status(204).send({
      deletedMeal,
    });
  });
}
