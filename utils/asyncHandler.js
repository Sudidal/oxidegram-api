class AsyncHandler {
  constructor() {}

  handle = async (func, errCallback = null) => {
    try {
      const result = await func();
      return [result, null];
    } catch (err) {
      if (errCallback) errCallback(new Error(err));
      else {
        console.error(err);
      }
      return [null, err];
    }
  };

  prismaQuery = async (query, errCallback = null) => {
    // Since Im lazy to implement something suibtable for
    // prisma errors, I'll just use the general function
    // and easily change this whenever I feel to

    if (
      query?.toString() !== "[object PrismaPromise]" &&
      query()?.toString() !== "[object PrismaPromise]"
    ) {
      console.error(
        "Didn't supply a prisma query to asyncHandler.prismaQuery()"
      );
    }

    return this.handle(query, errCallback);
  };
}

const asyncHandler = new AsyncHandler();
export default asyncHandler;
