import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import api from "../services/api.js";
import getErrorMessage from "../services/errorMessage.js";
import formatPrice from "../services/formatPrice.js";
import NoRestaurantNotice from "../components/NoRestaurantNotice.jsx";
import FoodImage from "../components/FoodImage.jsx";
import checkImageUrl from "../services/validateImageUrl.js";

const emptyForm = { name: "", description: "", price: "", imageUrl: "" };

function OwnerMenuPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noRestaurant, setNoRestaurant] = useState(false);
  const [error, setError] = useState("");

  // Add / edit dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null means "adding a new item"
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [itemToDelete, setItemToDelete] = useState(null);

  // The item whose switch or delete request is running
  const [busyItemId, setBusyItemId] = useState(null);

  useEffect(() => {
    async function loadMenu() {
      try {
        const restaurantResponse = await api.get("/api/restaurants/my");
        setRestaurant(restaurantResponse.data);
        const menuResponse = await api.get(
          `/api/restaurants/${restaurantResponse.data.id}/menu`,
        );
        setItems(menuResponse.data.items);
      } catch (err) {
        if (err.response && err.response.status === 404 && !restaurant) {
          setNoRestaurant(true);
        } else {
          setError(getErrorMessage(err));
        }
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  function openAddDialog() {
    setEditingItem(null);
    setForm(emptyForm);
    setFormError("");
    setFormOpen(true);
  }

  function openEditDialog(item) {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      imageUrl: item.imageUrl || "",
    });
    setFormError("");
    setFormOpen(true);
  }

  function changeField(field, value) {
    setForm({ ...form, [field]: value });
  }

  // Same rules as the backend: name required, price above 0 with at most 2 decimals
  function validateForm() {
    if (form.name.trim() === "") return "Food name is required.";
    if (form.name.trim().length > 100)
      return "Name must be at most 100 characters.";
    if (form.description.length > 500)
      return "Description must be at most 500 characters.";
    if (form.price.trim() === "") return "Price is required.";
    if (!/^\d{1,8}(\.\d{1,2})?$/.test(form.price.trim())) {
      return "Price must be a number with at most 2 decimals.";
    }
    if (Number(form.price) <= 0) return "Price must be greater than zero.";
    const imageProblem = checkImageUrl(form.imageUrl);
    if (imageProblem) return imageProblem;
    return "";
  }

  async function handleSave() {
    setFormError("");
    const problem = validateForm();
    if (problem) {
      setFormError(problem);
      return;
    }

    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      imageUrl: form.imageUrl.trim(),
    };
    const menuUrl = `/api/restaurants/${restaurant.id}/menu/items`;

    setSaving(true);
    try {
      if (editingItem) {
        const response = await api.put(
          `${menuUrl}/${editingItem.itemId}`,
          body,
        );
        setItems((oldItems) =>
          oldItems.map((item) =>
            item.itemId === response.data.itemId ? response.data : item,
          ),
        );
      } else {
        const response = await api.post(menuUrl, body);
        setItems((oldItems) => [...oldItems, response.data]);
      }
      setFormOpen(false);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAvailability(item) {
    setError("");
    setBusyItemId(item.itemId);
    try {
      const response = await api.patch(
        `/api/restaurants/${restaurant.id}/menu/items/${item.itemId}/availability`,
        { available: !item.available },
      );
      setItems((oldItems) =>
        oldItems.map((oldItem) =>
          oldItem.itemId === response.data.itemId ? response.data : oldItem,
        ),
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleDelete() {
    const item = itemToDelete;
    setError("");
    setBusyItemId(item.itemId);
    try {
      await api.delete(
        `/api/restaurants/${restaurant.id}/menu/items/${item.itemId}`,
      );
      setItems((oldItems) =>
        oldItems.filter((oldItem) => oldItem.itemId !== item.itemId),
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyItemId(null);
      setItemToDelete(null);
    }
  }

  if (loading) {
    return (
      <Container className="page">
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container className="page">
      <div className="top-row">
        <Typography variant="h5">Manage Menu</Typography>
        {restaurant && (
          <Button variant="contained" onClick={openAddDialog}>
            Add food item
          </Button>
        )}
      </div>

      {error && (
        <Alert severity="error" className="status-box">
          {error}
        </Alert>
      )}
      {noRestaurant && <NoRestaurantNotice />}

      {restaurant && items.length === 0 && (
        <Typography className="status-box">
          No food items yet. Click "Add food item".
        </Typography>
      )}

      {restaurant && items.length > 0 && (
        <TableContainer component={Paper} className="status-box">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Available</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.itemId}>
                  <TableCell>
                    <div className="name-with-image">
                      <FoodImage
                        src={item.imageUrl}
                        label={item.name}
                        height={40}
                        width={56}
                      />
                      <span>{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.description || "-"}</TableCell>
                  <TableCell>{formatPrice(item.price)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={item.available}
                      disabled={busyItemId === item.itemId}
                      onChange={() => handleToggleAvailability(item)}
                    />
                    {item.available ? "Yes" : "No"}
                  </TableCell>
                  <TableCell>
                    <div className="table-actions">
                      <Button size="small" onClick={() => openEditDialog(item)}>
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        disabled={busyItemId === item.itemId}
                        onClick={() => setItemToDelete(item)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add / edit dialog */}
      <Dialog
        open={formOpen}
        onClose={() => !saving && setFormOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingItem ? "Edit food item" : "Add food item"}
        </DialogTitle>
        <DialogContent>
          <div className="form-fields dialog-fields">
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Food name"
              value={form.name}
              onChange={(e) => changeField("name", e.target.value)}
              fullWidth
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => changeField("description", e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
            <TextField
              label="Price"
              value={form.price}
              onChange={(e) => changeField("price", e.target.value)}
              helperText="Greater than 0, at most 2 decimals"
              fullWidth
            />
            <TextField
              label="Image link (optional)"
              value={form.imageUrl}
              onChange={(e) => changeField("imageUrl", e.target.value)}
              helperText="Paste a direct image link starting with https://"
              fullWidth
            />
            {form.imageUrl.trim() !== "" && (
              <div className="preview-box">
                <FoodImage
                  key={form.imageUrl}
                  src={form.imageUrl.trim()}
                  label={form.name || "Food"}
                  height={120}
                />
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
      >
        <DialogTitle>Delete food item?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete "{itemToDelete ? itemToDelete.name : ""}" from the menu? Old
            orders keep their saved name and price.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemToDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default OwnerMenuPage;
