class BaseController {
  constructor() {}

  get(req, res, next) {
    res.json({ message: "You are in the index route" });
  }
}

const baseController = new BaseController();
export default baseController;
