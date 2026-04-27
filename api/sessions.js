export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.try.be/shop/sessions', {
      headers: {
        Authorization: `Bearer ${process.env.TRYBE_API_KEY}`,
        Accept: 'application/json'
      }
    });

    const json = await response.json();

    res.status(200).json({
      status: response.status,
      ok: response.ok,
      raw: json
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch Trybe sessions',
      message: error.message
    });
  }
}
