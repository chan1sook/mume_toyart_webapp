import { Router, json } from "express";

import { error } from "../../utils/logging.js";
import { getUserById, userLogin } from "../../logics/user.js";
import APIError, {
  APILoginAuthFailedError,
  APIMissingFormParameterError,
  APIServerNoSessionError,
} from "../../utils/apierror.js";

const router = Router();

router.post("/login", json(), async (req, res) => {
  try {
    if (!req.body || !req.body.username || !req.body.password) {
      throw APIMissingFormParameterError;
    }

    const fullUserData = await userLogin(req.body.username, req.body.password);
    if (fullUserData) {
      const userData = {
        _id: fullUserData._id,
        username: fullUserData.username,
        role: fullUserData.role,
      };

      req.session.userData = userData;

      res.status(200).json({
        status: "OK",
        userData: fullUserData,
      });
    } else {
      throw APILoginAuthFailedError;
    }
  } catch (err) {
    let code = 500;
    let errorId;

    if (err instanceof APIError) {
      code = err.code;
      errorId = err.errorId;
    }

    error(err.message, { name: "API", tags: [`${code}`] });
    res.status(code).json({
      status: "Error",
      code,
      errorId,
      message: err.message,
    });
  }
});

router.get("/user", async (req, res) => {
  try {
    if (!req.session) {
      throw APIServerNoSessionError;
    }

    let fullUserData = {
      role: "guest",
    };

    if (req.session.userData) {
      const userData = await getUserById(req.session.userData._id);

      if (userData) {
        const result = userData.toJSON();
        delete result.hashedPw;
        fullUserData = result;
      }
    }

    res.status(200).json({
      status: "OK",
      userData: fullUserData,
    });
  } catch (err) {
    let code = 500;

    if (err instanceof APIError) {
      code = err.code;
    }

    error(err.message, { name: "API", tags: [`${code}`] });
    res.status(code).json({
      status: "Error",
      code,
      message: err.message,
    });
  }
});

router.post("/logout", (req, res) => {
  try {
    delete req.session.userData;

    res.status(200).json({
      status: "OK",
    });
  } catch (err) {
    let code = 500;

    if (err instanceof APIError) {
      code = err.code;
    }

    error(err.message, { name: "API", tags: [`${code}`] });
    res.status(code).json({
      status: "Error",
      code,
      message: err.message,
    });
  }
});

export default router;
