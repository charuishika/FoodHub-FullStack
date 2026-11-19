import { useState } from "react";

// Shows a picture. If there is no link or it cannot load, shows a colored box with the first letter.
// ratio (like "4 / 3") keeps the picture's shape. Without it, the fixed height is used.
// Tip: give it key={src} when the link can change (like in a form preview), so it tries again.
function FoodImage({ src, label, height, width, ratio }) {
  const [failed, setFailed] = useState(false);
  const size = ratio
    ? { width: width || "100%", aspectRatio: ratio }
    : { height: height, width: width || "100%" };

  if (failed || !src) {
    return (
      <div className="image-fallback" style={size}>
        {label.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={label}
      className="food-image"
      style={size}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

export default FoodImage;
