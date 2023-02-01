import { getDB } from "../helper";

export default async function getRandom(req: any, res: any) {
  // setup
  //   get amount from url query. if not specified, default to 2
  const amount = req.query.amount ? parseInt(req.query.amount) : 2;

  // at this point, the data is valid
  const { db } = getDB();
  //   get 2 random user from users collection
  const usersRef = db.collection("users");
  const snapshot = await usersRef.orderBy("rating", "desc").limit(amount).get();
  const respond: any = [];
  snapshot.forEach((doc: any) => {
    console.log(doc.id, "=>", doc.data());
    const toBePushed = doc.data();
    respond.push(toBePushed);
  });

  res.send(respond);
}
