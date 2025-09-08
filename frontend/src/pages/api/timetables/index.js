import { adminDb } from "../../../lib/firebaseAdmin";

export default async function handler(req, res) {
  if (!adminDb) return res.status(500).json({ error: "Server not configured for Firestore" });

  try {
    if (req.method === "GET") {
      const { status } = req.query;
      let q = adminDb.collection("timetables");
      if (status) q = q.where("status", "==", status);
      const snap = await q.get();
      const timetables = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.status(200).json(timetables);
    }

    if (req.method === "POST") {
      const draft = req.body;
      if (!draft.timetable) {
        return res.status(400).json({ error: "Timetable data required" });
      }
      const toCreate = {
        ...draft,
        ownerId: draft.ownerId || null,
        status: draft.status || "pending",
        createdAt: new Date().toISOString(),
      };
      const docRef = await adminDb.collection("timetables").add(toCreate);
      const created = { id: docRef.id, ...toCreate };
      return res.status(201).json(created);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error("timetables index api error", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}