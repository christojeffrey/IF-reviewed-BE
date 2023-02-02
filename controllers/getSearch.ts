import { getDB } from "../helper";

export default async function getSearch(req: any, res: any) {
  // setup
  //   get amount from url query. if not specified, default to 2
  const searchQuery = req.query.searchQuery;

  console.log(searchQuery);

  // at this point, the data is valid
  const { db } = getDB();

  const usersRef = db.collection("users");
  //   get any user with name or NIM that contains searchQuery
  const snapshot = await usersRef
    .where("name", ">=", searchQuery)
    .where("name", "<=", searchQuery + "\uf8ff")
    .get();

  const snapshot2 = await usersRef
    .where("NIM", ">=", searchQuery)
    .where("NIM", "<=", searchQuery + "\uf8ff")
    .get();

  const respond: any = [];
  snapshot.forEach((doc: any) => {
    console.log(doc.id, "=>", doc.data());
    const toBePushed = doc.data();
    respond.push(toBePushed);
  });

  snapshot2.forEach((doc: any) => {
    console.log(doc.id, "=>", doc.data());
    const toBePushed = doc.data();
    respond.push(toBePushed);
  });

  res.send(respond);
}
