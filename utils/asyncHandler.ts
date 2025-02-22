import { Prisma } from "@prisma/client";

class AsyncHandler {
  constructor() {}

  handle = async <T>(
    func: () => Promise<T>,
    errCallback?: (err: Error) => void
  ): Promise<[T | null, Error | null]> => {
    try {
      const result = await func();
      return [result, null];
    } catch (err) {
      if (errCallback) errCallback(new Error(err));
      else {
        console.error(err);
      }
      return [null, new Error(err)];
    }
  };

  prismaQuery = async <T>(
    query: () => Prisma.PrismaPromise<T>,
    errCallback?: (err: Error) => void
  ) => {
    // Since Im lazy to implement something suibtable for
    // prisma errors, I'll just use the general function
    // and easily change this whenever I feel to

    return await this.handle(query, errCallback);
  };
}

const asyncHandler = new AsyncHandler();
export default asyncHandler;
