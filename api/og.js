// OG image is now a static PNG at /og-image.png
// This redirect exists for backwards compatibility
export default function handler(req, res) {
  res.redirect(301, '/og-image.png')
}
