// Returns an error message, or "" if the link is fine. An empty link is allowed.
function checkImageUrl(text) {
  const value = text.trim();
  if (value === "") return "";
  if (value.length > 500) return "Image link must be at most 500 characters.";
  if (!/^https?:\/\/\S+$/i.test(value))
    return "Image link must start with http:// or https://";
  return "";
}

export default checkImageUrl;
