import { createSlice } from "@reduxjs/toolkit";

const MAX_QUANTITY = 50; // the backend allows at most 50 of one item

const initialState = {
  restaurantId: null,
  restaurantName: "",
  items: [], // each item: { itemId, name, price, quantity }
};

// When the last item is removed, the cart no longer belongs to any restaurant
function resetIfEmpty(state) {
  if (state.items.length === 0) {
    state.restaurantId = null;
    state.restaurantName = "";
  }
}

const cartSlice = createSlice({
  name: "cart",
  initialState: initialState,
  reducers: {
    addItem(state, action) {
      const { restaurantId, restaurantName, item } = action.payload;

      if (state.items.length === 0) {
        state.restaurantId = restaurantId;
        state.restaurantName = restaurantName;
      }

      if (state.restaurantId !== restaurantId) {
        return;
      }

      const existing = state.items.find((i) => i.itemId === item.itemId);
      if (existing) {
        if (existing.quantity < MAX_QUANTITY) {
          existing.quantity += 1;
        }
      } else {
        state.items.push({
          itemId: item.itemId,
          name: item.name,
          price: Number(item.price),
          imageUrl: item.imageUrl || null,
          quantity: 1,
        });
      }
    },

    replaceCart(state, action) {
      const { restaurantId, restaurantName, item } = action.payload;
      state.restaurantId = restaurantId;
      state.restaurantName = restaurantName;
      state.items = [
        {
          itemId: item.itemId,
          name: item.name,
          price: Number(item.price),
          imageUrl: item.imageUrl || null,
          quantity: 1,
        },
      ];
    },

    increaseQuantity(state, action) {
      const item = state.items.find((i) => i.itemId === action.payload);
      if (item && item.quantity < MAX_QUANTITY) {
        item.quantity += 1;
      }
    },

    decreaseQuantity(state, action) {
      const item = state.items.find((i) => i.itemId === action.payload);
      if (!item) {
        return;
      }
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        state.items = state.items.filter((i) => i.itemId !== action.payload);
        resetIfEmpty(state);
      }
    },

    removeItem(state, action) {
      state.items = state.items.filter((i) => i.itemId !== action.payload);
      resetIfEmpty(state);
    },

    clearCart() {
      return initialState;
    },
  },
});

export const {
  addItem,
  replaceCart,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  clearCart,
} = cartSlice.actions;

export function selectTotalQuantity(state) {
  return state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function selectTotalPrice(state) {
  return state.cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
}

export default cartSlice.reducer;
