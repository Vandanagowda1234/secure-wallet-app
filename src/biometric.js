import sha256 from "crypto-js/sha256";

/** Turn click coordinates into a hash */
export function hashPicturePattern(points) {
  return sha256(JSON.stringify(points)).toString();
}

/** Component logic to capture clicks on an image */
export function handleImageClick(e, setPoints) {
  const rect = e.target.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width).toFixed(2);
  const y = ((e.clientY - rect.top) / rect.height).toFixed(2);
  setPoints((prev) => [...prev, { x, y }]);
}
