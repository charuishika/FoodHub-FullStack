// The ONLY place where timestamps are converted for display.
// timestamp: UTC string from the backend, like "2026-11-14T15:00:00Z"
// timeZone:  the logged-in user's IANA timezone, like "Asia/Kolkata"
// The original timestamp is never changed. Only the displayed text differs.
function formatDate(timestamp, timeZone) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timeZone,
  }).format(new Date(timestamp));
}

export default formatDate;
