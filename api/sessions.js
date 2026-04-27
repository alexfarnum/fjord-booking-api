export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const ALLOWED_SESSION_TYPES = ["Shared Session", "Private Session"];
    const now = new Date();

    let allSessions = [];
    let page = 1;
    let lastPage = 1;

    do {
      const response = await fetch(`https://api.try.be/shop/sessions?page=${page}`, {
        headers: {
          Authorization: `Bearer ${process.env.TRYBE_API_KEY}`,
          Accept: "application/json"
        }
      });

      const json = await response.json();

      allSessions = allSessions.concat(json.data || []);
      lastPage = json.meta?.last_page || 1;
      page++;
    } while (page <= lastPage);

    const filtered = allSessions.filter(session => {
      const isAllowedType = ALLOWED_SESSION_TYPES.includes(session.session_type_name);
      const isFutureSession = new Date(session.start_time) >= now;
      return isAllowedType && isFutureSession;
    });

    const sessions = filtered
      .map(s => ({
        id: s.id,
        type: s.session_type_name,
        startTime: s.start_time,
        endTime: s.end_time,
        remainingSpots: s.remaining_capacity,
        capacity: s.capacity,
        price: s.price,
        currency: s.currency,
        room: s.room?.name || null,
        soldOut: Number(s.remaining_capacity) <= 0
      }))
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    return res.status(200).json({ sessions });

  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch Trybe sessions",
      message: error.message
    });
  }
}
