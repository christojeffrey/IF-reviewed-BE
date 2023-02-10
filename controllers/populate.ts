import { getDB } from "../helper";
import studentData from "./studentData";
const { Timestamp } = require("firebase-admin/firestore");

export default async function populate(req: any, res: any) {
  // setup
  const NIM = 13520000;
  const name = "Joko Anwar";

  const { db } = getDB();
  const batch = db.batch();

  for (let i = 0; i < studentData.length; i++) {
    const userRef = db.collection("users").doc(studentData[i][2]);
    batch.set(
      userRef,
      {
        name: studentData[i][0],
        rating: 0,
        comStyle: 0,
        totalReviews: 0,
        lastUpdated: Timestamp.now().toDate().toString(),
        NIM: studentData[i][2],
      },
      { merge: true }
    );
  }

  const respond = await batch.commit();

  res.send(respond);
}
