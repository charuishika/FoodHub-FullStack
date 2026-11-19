import "dotenv/config";
import axios from "axios";

// Talks directly to Spring Boot. Run it from the gateway folder: node scripts/seed.js
const http = axios.create({
  baseURL: process.env.BACKEND_URL || "http://localhost:8080",
  timeout: 15000,
  validateStatus: () => true, // we check status codes ourselves
});

const PASSWORD = "password123";

// [owner name, restaurant name, description, location, [ [food, description, price], ... ]]
const restaurants = [
  [
    "Arjun Mehta",
    "Spice Garden",
    "North Indian curries and fresh breads",
    "Reston, VA",
    [
      ["Paneer Butter Masala", "Creamy tomato gravy", 250],
      ["Dal Makhani", "Slow cooked black lentils", 210],
      ["Garlic Naan", "Soft naan with garlic butter", 60],
      ["Jeera Rice", "Basmati rice with cumin", 120],
      ["Gulab Jamun", "Sweet milk dumplings", 90],
    ],
  ],
  [
    "Sneha Reddy",
    "Dosa Corner",
    "South Indian breakfast and tiffin",
    "Hyderabad",
    [
      ["Masala Dosa", "Crispy dosa with potato filling", 110],
      ["Idli Sambar", "Steamed rice cakes with sambar", 80],
      ["Medu Vada", "Fried lentil doughnuts", 70],
      ["Filter Coffee", "Strong South Indian coffee", 40],
      ["Rava Upma", "Semolina with vegetables", 75],
    ],
  ],
  [
    "Marco Rossi",
    "Pizza Palace",
    "Wood fired pizzas and pasta",
    "Chicago, IL",
    [
      ["Margherita Pizza", "Tomato, mozzarella, basil", 300],
      ["Veggie Supreme Pizza", "Loaded with vegetables", 380],
      ["Penne Arrabbiata", "Spicy tomato pasta", 260],
      ["Garlic Bread", "Toasted with herb butter", 120],
      ["Tiramisu", "Classic Italian dessert", 180],
    ],
  ],
  [
    "Li Wei",
    "Wok Express",
    "Quick Chinese and Indo-Chinese dishes",
    "Bengaluru",
    [
      ["Veg Hakka Noodles", "Stir fried noodles", 160],
      ["Chilli Paneer", "Paneer in spicy sauce", 220],
      ["Veg Manchurian", "Vegetable balls in gravy", 190],
      ["Fried Rice", "Wok tossed rice", 150],
      ["Spring Rolls", "Crispy vegetable rolls", 130],
    ],
  ],
  [
    "Daniel Brown",
    "Burger Barn",
    "Juicy burgers and crispy fries",
    "Austin, TX",
    [
      ["Classic Burger", "Beef patty with cheese", 280],
      ["Chicken Burger", "Crispy chicken fillet", 260],
      ["French Fries", "Salted golden fries", 110],
      ["Onion Rings", "Battered and fried", 120],
      ["Chocolate Shake", "Thick chocolate milkshake", 150],
    ],
  ],
  [
    "Fatima Khan",
    "Biryani House",
    "Hyderabadi dum biryani",
    "Chennai",
    [
      ["Chicken Biryani", "Dum cooked with spices", 290],
      ["Veg Biryani", "Fragrant vegetable biryani", 230],
      ["Mutton Biryani", "Tender mutton pieces", 350],
      ["Raita", "Cool yogurt side", 40],
      ["Double Ka Meetha", "Bread pudding dessert", 100],
    ],
  ],
];

const customerNames = [
  "Priya Sharma",
  "Rahul Verma",
  "Ananya Iyer",
  "Karthik Nair",
  "Meera Joshi",
  "Vikram Singh",
  "Divya Menon",
  "Rohan Gupta",
  "Kavya Pillai",
  "Aditya Rao",
];

function checkStatus(response, okStatuses, what) {
  if (!okStatuses.includes(response.status)) {
    const message =
      response.data && response.data.message
        ? response.data.message
        : "no message";
    throw new Error(`${what} failed: HTTP ${response.status} (${message})`);
  }
}

async function register(name, email, role) {
  // 201 = created, 409 = already exists (fine when running twice)
  const response = await http.post("/api/auth/register", {
    name,
    email,
    password: PASSWORD,
    role,
  });
  checkStatus(response, [201, 409], `Register ${email}`);
}

async function login(email) {
  const response = await http.post("/api/auth/login", {
    email,
    password: PASSWORD,
  });
  checkStatus(response, [200], `Login ${email}`);
  return { headers: { Authorization: `Bearer ${response.data.token}` } };
}

async function seedRestaurants() {
  const restaurantIds = [];

  for (let i = 0; i < restaurants.length; i++) {
    const [ownerName, name, description, location, foods] = restaurants[i];
    const email = `owner${i + 1}@foodhub.com`;

    await register(ownerName, email, "OWNER");
    const auth = await login(email);

    // Find this owner's restaurant, or create it
    let response = await http.get("/api/restaurants/my", auth);
    if (response.status === 404) {
      response = await http.post(
        "/api/restaurants",
        { name, description, location },
        auth,
      );
      checkStatus(response, [201], `Create restaurant ${name}`);
    } else {
      checkStatus(response, [200], `Get restaurant ${name}`);
    }
    const restaurantId = response.data.id;
    restaurantIds.push(restaurantId);

    // Add menu items only if the menu is empty
    const menuResponse = await http.get(
      `/api/restaurants/${restaurantId}/menu`,
      auth,
    );
    checkStatus(menuResponse, [200], `Get menu of ${name}`);
    if (menuResponse.data.items.length === 0) {
      for (const [foodName, foodDescription, price] of foods) {
        const itemResponse = await http.post(
          `/api/restaurants/${restaurantId}/menu/items`,
          { name: foodName, description: foodDescription, price: price },
          auth,
        );
        checkStatus(itemResponse, [201], `Add item ${foodName}`);
      }
    }
    console.log(`Restaurant ready: ${name} (id ${restaurantId})`);
  }

  return restaurantIds;
}

async function seedCustomersAndOrders(restaurantIds) {
  for (let i = 0; i < customerNames.length; i++) {
    const email = `customer${i + 1}@foodhub.com`;
    await register(customerNames[i], email, "CUSTOMER");
    const auth = await login(email);

    // 4 orders per customer, in 4 different restaurants
    for (let k = 0; k < 4; k++) {
      const restaurantId = restaurantIds[(i + k) % restaurantIds.length];
      const menuResponse = await http.get(
        `/api/restaurants/${restaurantId}/menu`,
        auth,
      );
      checkStatus(menuResponse, [200], `Get menu ${restaurantId}`);
      const items = menuResponse.data.items;

      const body = {
        restaurantId: restaurantId,
        items: [
          { itemId: items[k].itemId, quantity: k + 1 },
          { itemId: items[k + 1].itemId, quantity: 1 },
        ],
      };

      // A fixed key per (customer, order) means running the script again creates no duplicates
      const response = await http.post("/api/orders", body, {
        headers: {
          ...auth.headers,
          "Idempotency-Key": `seed-order-${i + 1}-${k + 1}`,
        },
      });
      checkStatus(response, [200, 201], `Order for ${email}`);
    }
    console.log(`Customer ready: ${email} (4 orders)`);
  }
}

async function main() {
  console.log("Seeding FoodHub data...");
  const restaurantIds = await seedRestaurants();
  await seedCustomersAndOrders(restaurantIds);
  console.log("");
  console.log("Done. Logins (password for all: " + PASSWORD + ")");
  console.log("  Owners:    owner1@foodhub.com ... owner6@foodhub.com");
  console.log("  Customers: customer1@foodhub.com ... customer10@foodhub.com");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
