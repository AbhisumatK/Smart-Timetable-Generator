import { adminDb } from "../../../../lib/firebaseAdmin";

export default async function handler(req, res) {
  if (!adminDb) return res.status(500).json({ error: "Server not configured for Firestore" });

  const { id } = req.query;
  const ref = adminDb.collection("timetables").doc(id);

  try {
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Timetable not found" });

    if (req.method === "DELETE") {
      await ref.delete();
      return res.status(200).json({ message: "Timetable deleted" });
    }

    if (req.method === "PUT") {
      const { action, comments, approver } = req.body;
      if (!action || (action !== "approve" && action !== "reject")) {
        return res.status(400).json({ error: "Invalid action" });
      }

      if (action === "approve") {
        await ref.update({
          status: "approved",
          approvedBy: approver || "unknown",
          approvedAt: new Date().toISOString(),
          comments: ""
        });
        return res.status(200).json({ message: "Timetable approved" });
      }

      if (action === "reject") {
        if (!comments || comments.trim() === "") {
          return res.status(400).json({ error: "Comments required for rejection" });
        }
        await ref.update({
          status: "rejected",
          approvedBy: approver || "unknown",
          approvedAt: new Date().toISOString(),
          comments
        });
        return res.status(200).json({ message: "Timetable rejected" });
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error("timetables [id] api error", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}