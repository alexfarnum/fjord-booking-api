export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.try.be/shop/sessions', {
      headers: {
        Authorization: `Bearer ${process.env.TRYBE_API_KEY}`,
        Accept: 'application/json'
      }
    });

    const json = await response.json();

    const sessions = (json.data || []).map(session => ({
      id: session.id,
      type: session.session_type_name,
      startTime: session.start_time,
      endTime: session.end_time,
      remainingSpots: session.remaining_capacity,
      price: session.price,
      soldOut: session.remaining_capacity <= 0
    }));

    res.status(200).json({ sessions });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch Trybe sessions'
    });
  }
}
