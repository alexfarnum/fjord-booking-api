export default async function handler(req, res) {
  try {
    let allSessions = [];
    let page = 1;
    let hasNext = true;

    while (hasNext) {
      const response = await fetch(`https://api.try.be/shop/sessions?page=${page}`, {
        headers: {
          Authorization: `Bearer ${process.env.TRYBE_API_KEY}`,
          Accept: 'application/json'
        }
      });

      const json = await response.json();

      allSessions = allSessions.concat(json.data || []);

      hasNext = json.links && json.links.next;
      page++;
    }

    const sessions = allSessions.map(session => ({
      id: session.id,
      type: session.session_type_name,
      startTime: session.start_time,
      endTime: session.end_time,
      remainingSpots: session.remaining_capacity,
      capacity: session.capacity,
      price: session.price,
      currency: session.currency,
      room: session.room?.name || '',
      soldOut: Number(session.remaining_capacity) <= 0
    }));

    res.status(200).json({ sessions });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch Trybe sessions',
      message: error.message
    });
  }
}
