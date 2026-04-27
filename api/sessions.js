export default async function handler(req, res) {
  try {
    let allSessions = [];
    let page = 1;
    let hasNext = true;

    while (hasNext) {
      const response = await fetch(`https://api.try.be/shop/sessions?page=${page}`, {
        headers: {
          Authorization: `Bearer ${process.env.TRYBE_API_KEY}`,
          Accept: "application/json"
        }
      });

      const json = await response.json();

      allSessions = allSessions.concat(json.data || []);
      hasNext = json.links && json.links.next;
      page++;
    }

    const publicSessions = allSessions.filter(session => {
      const visibility = (
        session.visibility ||
        session.status ||
        session.access ||
        session.booking_visibility ||
        session.availability_visibility ||
        ""
      ).toLowerCase();

      const isPrivate =
        visibility.includes("private") ||
        visibility.includes("by_link") ||
        visibility.includes("by link") ||
        visibility.includes("link_only") ||
        visibility.includes("link only") ||
        session.private === true ||
        session.is_private === true ||
        session.by_link_only === true ||
        session.is_by_link_only === true;

      return !isPrivate;
    });

    const sessions = publicSessions.map(session => ({
      id: session.id,
      type: session.session_type_name,
      startTime: session.start_time,
      endTime: session.end_time,
      remainingSpots: session.remaining_capacity,
      capacity: session.capacity,
      price: session.price,
      currency: session.currency,
      room: session.room?.name || "",
      soldOut: Number(session.remaining_capacity) <= 0
    }));

    res.status(200).json({ sessions });

  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch Trybe sessions",
      message: error.message
    });
  }
}
