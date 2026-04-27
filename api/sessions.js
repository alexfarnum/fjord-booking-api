export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.try.be/shop/sessions?page=1", {
      headers: {
        Authorization: `Bearer ${process.env.TRYBE_API_KEY}`,
        Accept: "application/json"
      }
    });

    const json = await response.json();

    res.status(200).json({
      sample: json.data?.[0] || null,
      keys: json.data?.[0] ? Object.keys(json.data[0]) : []
    });

  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch Trybe sessions",
      message: error.message
    });
  }
}
