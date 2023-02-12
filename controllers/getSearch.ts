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
  const snapshot = await usersRef.get();

  const respond: any = [];
  snapshot.forEach((doc: any) => {
    //  filter. make in case insensitive
    if (doc.data().name.toLowerCase().includes(searchQuery.toLowerCase()) || doc.data().NIM.toLowerCase().includes(searchQuery.toLowerCase())) {
      respond.push(doc.data());
    }
  });

  // limit to 20 if more than 20
  if (respond.length > 20) {
    respond.length = 20;
  }

  res.send(respond);
}
