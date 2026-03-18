import { getUserById, updateUserProfile } from "../services/user.service.js";

export const profile = async (req, res, next) => {
  try {
    const user = await getUserById(req.user._id);
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updated = await updateUserProfile(req.user._id, req.body);
    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
};