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

  profileIncludeOptions = {
    _count: {
      select: {
        followers: true,
      },
    },
  };
}

const prismaOptions = new PrismaOptions();
export default prismaOptions;
