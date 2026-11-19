import FoodHubClient from "./FoodHubClient.js";

const foodHubClient = new FoodHubClient(process.env.BACKEND_URL);

export default foodHubClient;
