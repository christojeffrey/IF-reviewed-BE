import { getDB } from "../helper";
const { Timestamp } = require("firebase-admin/firestore");

export default async function populate(req: any, res: any) {
  // setup
  const NIM = 13520000;
  const name = "Joko Anwar";

  const { db } = getDB();
  const batch = db.batch();
  for (let i = 0; i < 5; i++) {
    const userRef = db.collection("users").doc((NIM + i).toString());
    batch.set(
      userRef,
      {
        name: name,
        rating: 0,
        comStyle: 0,
        totalReviews: 0,
        lastUpdated: Timestamp.now().toDate().toString(),
        NIM: (NIM + i).toString(),
      },
      { merge: true }
    );
  }
  const respond = await batch.commit();

  res.send(respond);
}
