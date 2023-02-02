import { getDB } from "../helper";

export default async function getNIM(req: any, res: any) {
  const { NIM } = req.params;
  const { db } = getDB();
  const userRef = db.collection("users").doc(NIM);
  const user = await userRef.get();
  if (!user.exists) {
    res.json({ error: "User doesn't exist" }).status(404);
  } else {
    const data = user.data();
    res.json({ data });
  }
}
