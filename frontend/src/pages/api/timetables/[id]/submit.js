import drafts from "../index";

export default function handler(req, res) {
  if (req.method !== "PUT") return res.status(405).end("Method Not Allowed");

  const { id } = req.query;
  const index = drafts.findIndex((d) => d.id === id);
  if (index < 0) return res.status(404).json({ message: "Draft not found" });

  drafts[index].status = "pending";

  res.status(200).json(drafts[index]);
}