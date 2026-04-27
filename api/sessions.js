export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.try.be/shop/sessions?page=1", {
      headers: {
        Authorization: `Bearer ${process.env.TRYBE_API_KEY}`,
        Accept: "application/json"
      }
    });

    const json = await response.json();

    // ✅ Only allow these session types
    const ALLOWED_SESSION_TYPES = [
      "Shared Session",
      "Private Session"
    ];

    // ✅ Filter sessions BEFORE mapping
    const filtered = (json.data || []).filter(session =>
      ALLOWED_SESSION_TYPES.includes(session.session_type_name)
    );

    // ✅ Format for frontend (Squarespace)
    const sessions = filtered.map(s => ({
      id: s.id,
      type: s.session_type_name,
      startTime: s.start_time,
      endTime: s.end_time,
      remainingSpots: s.remaining_capacity,
      capacity: s.capacity,
      price: s.price,
      currency: s.currency,
      room: s.room?.name || null,
      soldOut: s.remaining_capacity <= 0
    }));

    res.status(200).json({ sessions });

  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch Trybe sessions",
      message: error.message
    });
  }
}
