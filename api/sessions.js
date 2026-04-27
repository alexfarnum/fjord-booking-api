export default async function handler(req, res) {
  try {
    const SITE_ID = "a13c06a5-d5cf-40dd-94a5-db36c20961f2";

    let allSessions = [];
    let page = 1;
    let lastPage = 1;

    do {
      const response = await fetch(
        `https://api.try.be/shop/sessions?site_id=${SITE_ID}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TRYBE_API_KEY}`,
            Accept: "application/json"
          }
        }
      );

      const json = await response.json();

      allSessions = allSessions.concat(json.data || []);
      lastPage = json.meta?.last_page || 1;
      page++;

    } while (page <= lastPage);

    const publicSessions = allSessions.filter(session => {
      const name = (session.session_type_name || "").toLowerCase();

      const isPrivateSessionType = name.includes("private");

      const isByLinkOnly =
        session.by_link_only === true ||
        session.is_by_link_only === true ||
        session.link_only === true ||
        session.is_link_only === true ||
        session.visibility === "by_link_only" ||
        session.visibility === "private";

      return !isPrivateSessionType && !isByLinkOnly;
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
