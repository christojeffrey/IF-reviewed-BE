import { getDB } from "../helper";
import studentData from "../helper/studentData";
import { firestore } from "firebase-admin";

export default async function getSearch(req: any, res: any) {
  // setup
  //   get amount from url query. if not specified, default to 2
  const searchQuery = req.query.searchQuery;

  console.log(searchQuery);

  // at this point, the data is valid
  const { db } = getDB();

  // TODO: Ubah for each ke data olahan (Array of NIMS)
  const userToBeRetrieved: any = [];

  studentData.forEach((val, key) => {
    if (key.toLowerCase().includes(searchQuery.toLowerCase()) || val.toLowerCase().includes(searchQuery.toLowerCase())) {
      userToBeRetrieved.push(key);
    }
  });

  // if userToBeRetrieved is empty, return empty array
  if (userToBeRetrieved.length === 0) {
    res.send([]);
    return;
  }

  // Limit the userToBeRetrieved to 10
  if (userToBeRetrieved.length > 10) {
    userToBeRetrieved.length = 10;
  }

  const respond: any = [];
  const usersRef = db.collection("users");
  //   get any user with name or NIM that contains searchQuery
  const snapshot = await usersRef.where(firestore.FieldPath.documentId(), "in", userToBeRetrieved).get();

  snapshot.forEach((doc: any) => {
    respond.push(doc.data());
  });

  res.send(respond);
}
