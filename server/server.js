import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";
import { AsyncDatabase } from "promised-sqlite3";

const server = fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = await AsyncDatabase.open("./menu-order.sqlite");

server.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/public/",
});

server.get("/api/meals", async function getMeals(req, res) {
  const mealsPromise = db.all(
    "SELECT meal_type_id, name, category, ingredients as description FROM meal_types"
  );
  const mealsizesPromise = db.all(
    `SELECT 
      meal_type_id as id, size, price
    FROM 
      meals
  `
  );

  const [meals, mealsizes] = await Promise.all([
    mealsPromise,
    mealsizesPromise,
  ]);

  const responseMeals = meals.map((meal) => {
    const sizes = mealsizes.reduce((acc, current) => {
      if (current.id === meal.meal_type_id) {
        acc[current.size] = +current.price;
      }
      return acc;
    }, {});
    return {
      id: meal.meal_type_id,
      name: meal.name,
      category: meal.category,
      description: meal.description,
      image: `/public/img/${meal.meal_type_id}.webp`,
      sizes,
    };
  });

  res.send(responseMeals);
});

server.get("/api/meal-of-the-day", async function getMealOfTheDay(req, res) {
  const meals = await db.all(
    `SELECT 
      meal_type_id as id, name, category, ingredients as description
    FROM 
      meal_types`
  );

  const daysSinceEpoch = Math.floor(Date.now() / 86400000);
  const mealIndex = daysSinceEpoch % meals.length;
  const meal = meals[mealIndex];

  const sizes = await db.all(
    `SELECT
      size, price
    FROM
      meals
    WHERE
      meal_type_id = ?`,
    [meal.id]
  );

  const sizeObj = sizes.reduce((acc, current) => {
    acc[current.size] = +current.price;
    return acc;
  }, {});

  const responseMeal = {
    id: meal.id,
    name: meal.name,
    category: meal.category,
    description: meal.description,
    image: `/public/img/${meal.id}.webp`,
    sizes: sizeObj,
  };

  res.send(responseMeal);
});

server.get("/api/orders", async function getOrders(req, res) {
  const id = req.query.id;
  const orders = await db.all("SELECT order_id, date, time FROM orders");

  res.send(orders);
});

server.get("/api/order", async function getOrders(req, res) {
  const id = req.query.id;
  const orderPromise = db.get(
    "SELECT order_id, date, time FROM orders WHERE order_id = ?",
    [id]
  );
  const orderItemsPromise = db.all(
    `SELECT 
      t.meal_type_id as mealTypeId, t.name, t.category, t.ingredients as description, o.quantity, p.price, o.quantity * p.price as total, p.size
    FROM 
      order_details o
    JOIN
      meals p
    ON
      o.meal_id = p.meal_id
    JOIN
      meal_types t
    ON
      p.meal_type_id = t.meal_type_id
    WHERE 
      order_id = ?`,
    [id]
  );

  const [order, orderItemsRes] = await Promise.all([
    orderPromise,
    orderItemsPromise,
  ]);

  const orderItems = orderItemsRes.map((item) =>
    Object.assign({}, item, {
      image: `/public/img/${item.mealTypeId}.webp`,
      quantity: +item.quantity,
      price: +item.price,
    })
  );

  const total = orderItems.reduce((acc, item) => acc + item.total, 0);

  res.send({
    order: Object.assign({ total }, order),
    orderItems,
  });
});

server.post("/api/order", async function createOrder(req, res) {
  const { cart } = req.body;

  const now = new Date();
  // forgive me Date gods, for I have sinned
  const time = now.toLocaleTimeString("en-US", { hour12: false });
  const date = now.toISOString().split("T")[0];

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    res.status(400).send({ error: "Invalid order data" });
    return;
  }

  try {
    await db.run("BEGIN TRANSACTION");

    const result = await db.run(
      "INSERT INTO orders (date, time) VALUES (?, ?)",
      [date, time]
    );
    const orderId = result.lastID;

    const mergedCart = cart.reduce((acc, item) => {
      const id = item.meal.id;
      const size = item.size.toLowerCase();
      if (!id || !size) {
        throw new Error("Invalid item data");
      }
      const mealId = `${id}_${size}`;

      if (!acc[mealId]) {
        acc[mealId] = { mealId, quantity: 1 };
      } else {
        acc[mealId].quantity += 1;
      }

      return acc;
    }, {});

    for (const item of Object.values(mergedCart)) {
      const { mealId, quantity } = item;
      await db.run(
        "INSERT INTO order_details (order_id, meal_id, quantity) VALUES (?, ?, ?)",
        [orderId, mealId, quantity]
      );
    }

    await db.run("COMMIT");

    res.send({ orderId });
  } catch (error) {
    req.log.error(error);
    await db.run("ROLLBACK");
    res.status(500).send({ error: "Failed to create order" });
  }
});

server.get("/api/past-orders", async function getPastOrders(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const pastOrders = await db.all(
      "SELECT order_id, date, time FROM orders ORDER BY order_id DESC LIMIT 10 OFFSET ?",
      [offset]
    );
    res.send(pastOrders);
  } catch (error) {
    req.log.error(error);
    res.status(500).send({ error: "Failed to fetch past orders" });
  }
});

server.get("/api/past-order/:order_id", async function getPastOrder(req, res) {
  const orderId = req.params.order_id;

  try {
    const order = await db.get(
      "SELECT order_id, date, time FROM orders WHERE order_id = ?",
      [orderId]
    );

    if (!order) {
      res.status(404).send({ error: "Order not found" });
      return;
    }

    const orderItems = await db.all(
      `SELECT 
        t.meal_type_id as mealTypeId, t.name, t.category, t.ingredients as description, o.quantity, p.price, o.quantity * p.price as total, p.size
      FROM 
        order_details o
      JOIN
        meals p
      ON
        o.meal_id = p.meal_id
      JOIN
        meal_types t
      ON
        p.meal_type_id = t.meal_type_id
      WHERE 
        order_id = ?`,
      [orderId]
    );

    const formattedOrderItems = orderItems.map((item) =>
      Object.assign({}, item, {
        image: `/public/img/${item.mealTypeId}.webp`,
        quantity: +item.quantity,
        price: +item.price,
      })
    );

    const total = formattedOrderItems.reduce(
      (acc, item) => acc + item.total,
      0
    );

    res.send({
      order: Object.assign({ total }, order),
      orderItems: formattedOrderItems,
    });
  } catch (error) {
    req.log.error(error);
    res.status(500).send({ error: "Failed to fetch order" });
  }
});

server.post("/api/contact", async function contactForm(req, res) {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).send({ error: "All fields are required" });
    return;
  }

  req.log.info(`Contact Form Submission:
    Name: ${name}
    Email: ${email}
    Message: ${message}
  `);

  res.send({ success: "Message received" });
});

const start = async () => {
  try {
    await server.listen({ port: PORT });
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
