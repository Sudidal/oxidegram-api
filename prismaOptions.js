class PrismaOptions {
  constructor() {}

  postIncludeOptions = (profileId = -1) => {
    return {
      author: true,
      likers: {
        where: {
          id: profileId,
        },
      },
      savers: {
        where: {
          id: profileId,
        },
      },
      _count: {
        select: {
          likers: true,
          comments: true,
        },
      },
    };
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
