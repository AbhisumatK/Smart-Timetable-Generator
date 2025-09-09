import { adminDb } from "../../../../lib/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!adminDb) return res.status(500).json({ error: "Server not configured for Firestore" });

  const { id } = req.query;

  try {
    const ref = adminDb.collection("timetables").doc(id);
    await ref.update({
      status: "pending",
      submittedAt: new Date().toISOString()
    });
    return res.status(200).json({ message: "Draft submitted for approval" });
  } catch (e) {
    console.error("timetables submit api error", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}