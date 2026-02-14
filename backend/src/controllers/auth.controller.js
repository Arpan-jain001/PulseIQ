import { registerUser, loginUser, refreshAccessToken, logoutUser } from "../services/auth.service.js";

const cookieOpts = () => ({
  httpOnly: true,
  secure: String(process.env.COOKIE_SECURE) === "true",
  sameSite: process.env.COOKIE_SAMESITE || "lax",
});

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ success: true, message: "Registered", data: { id: user._id, email: user.email, role: user.role } });
  } catch (e) {
    next(e);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, at, rt } = await loginUser(req.body);

    res
      .cookie("refreshToken", rt, cookieOpts())
      .json({
        success: true,
        accessToken: at,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          verificationStatus: user.verificationStatus,
        },
      });
  } catch (e) {
    next(e);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const rt = req.cookies.refreshToken;
    if (!rt) return res.status(401).json({ success: false, message: "No refresh token" });

    const { at } = await refreshAccessToken(rt);
    res.json({ success: true, accessToken: at });
  } catch (e) {
    next(e);
  }
};

export const logout = async (req, res, next) => {
  try {
    const rt = req.cookies.refreshToken;
    if (rt && req.user?.id) await logoutUser(req.user.id);

    res.clearCookie("refreshToken", cookieOpts());
    res.json({ success: true, message: "Logged out" });
  } catch (e) {
    next(e);
  }
};
