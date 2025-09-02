let drafts = []; // Simple in-memory store, persists only per server instance

export default function handler(req, res) {
  switch (req.method) {
    case "GET":
      // Query param ?status=...
      const status = req.query.status;
      if (status) {
        return res.status(200).json(drafts.filter((d) => d.status === status));
      }
      res.status(200).json(drafts);
      break;

    case "POST":
      const newDraft = { ...req.body, id: Date.now().toString(), status: "draft" };
      drafts.push(newDraft);
      res.status(201).json(newDraft);
      break;

    default:
      res.status(405).end("Method Not Allowed");
  }
}