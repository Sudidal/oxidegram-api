class AsyncHandler {
  constructor() {}

  prismaQuery = async (query, next = null) => {
    try {
      const result = await query();
      return [result, null];
    } catch (err) {
      if (next) next(err);
      return [null, err];
    }
  };
}

const asyncHandler = new AsyncHandler();
export default asyncHandler;
