class PrismaOptions {
  constructor() {}

  postIncludeOptions = {
    author: true,
    _count: {
      select: {
        likers: true,
        comments: true,
      },
    },
  };
}

const prismaOptions = new PrismaOptions();
export default prismaOptions;
