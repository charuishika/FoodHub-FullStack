import Chip from "@mui/material/Chip";

const colors = {
  PLACED: "info",
  ACCEPTED: "primary",
  PREPARING: "warning",
  READY: "success",
  REJECTED: "error",
};

function StatusChip({ status }) {
  return (
    <Chip label={status} color={colors[status] || "default"} size="small" />
  );
}

export default StatusChip;
