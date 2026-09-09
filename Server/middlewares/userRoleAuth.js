export function checkUserRole(req, res, next) {
  const { role } = req.user;
  // console.log(role);
  if (role !== "User") return next();
  res.status(403).json({ error: "You are not authorized to visit." });
}

export const checkIsAdminUser = (req, res, next) => {
  if (req.user.role === "Admin") return next();
  res.status(403).json({ error: "You can not delete users" });
};
