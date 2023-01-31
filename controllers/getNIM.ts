export default function getNIM(req: any, res: any) {
  const { NIM } = req.params;
  res.json({ nim: NIM });
}
