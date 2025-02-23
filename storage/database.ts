import {
  Prisma,
  Profile,
  Post,
  Gender,
  FileType,
  NotificationType,
} from "@prisma/client";
import asyncHandler from "../utils/asyncHandler";
import prisma from "../utils/prisma";

type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
type createAccountOptions = {
  email: string;
  password: string;
  username: string;
  fullName: string;
};
type updateProfileOptions = {
  username?: string;
  fullName?: string;
  bio?: string;
  country?: string;
  avatarUrl?: string;
  gender?: Gender;
  websiteUrl?: string;
  followId?: number;
  unfollowId?: number;
  savePostId?: number;
  unsavePostId?: number;
};
type getProfilesOptions = {
  profileId?: number;
  limit?: number;
  offset?: number;
  searchQuery?: string;
  order?: "asc" | "desc";
  sortByFollowers?: boolean;
  singleValue?: boolean;
};
type getDetailsOfProfileOptions = {
  posts?: boolean;
  follows?: boolean;
  followers?: boolean;
  savedPosts?: boolean;
  notifications?: boolean;
  contacts?: boolean;
};
type createPostOptions = {
  content: string;
  fileUrl: string;
  publishDate: Date;
  fileType: FileType;
  authorId: number;
};
type updatePostOptions = {
  content?: string;
  imageUrl?: string;
  likerId?: number;
  unlikerId?: number;
};
type GetPostsOptions = {
  postId?: number;
  filter?: "images" | "videos";
  sortByLikes?: boolean;
  order?: "asc" | "desc";
  offset?: number;
  limit?: number;
  singleValue?: boolean;
};
type CreateCommentOptions = {
  content: string;
  publishDate: Date;
  authorId: number;
};
type GetCommentsOptions = {
  postId?: number;
  take?: number;
  offset?: number;
};
type CreateContactOptions = {
  profileId: number;
  contactedId: number;
};

class Database {
  constructor() {}

  #profilesLimit = 10;
  #postsLimit = 7;
  #commentsLimit = 15;

  postIncludeOptions = (profileId = -1): Prisma.PostInclude => ({
    author: true,
    likers: {
      where: {
        id: profileId ?? -1,
      },
    },
    savers: {
      where: {
        id: profileId ?? -1,
      },
    },
    _count: {
      select: {
        likers: true,
        comments: true,
      },
    },
  });

  async createAccount(options: createAccountOptions) {
    const [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.user.create({
        data: {
          email: options.email,
          password: options.password,
          profile: {
            create: {
              username: options.username,
              fullName: options.fullName,
            },
          },
        },
      })
    );

    return [result, err];
  }

  async getProfiles(requestorProfileId: number, options: getProfilesOptions) {
    const additionalWhere: { id?: number } = {};
    if (options.profileId) additionalWhere.id = options.profileId;

    let [queryResult, err] = await asyncHandler.prismaQuery(() =>
      prisma.profile.findMany({
        take: options.limit || this.#profilesLimit,
        skip: options.offset || 0,

        where: {
          ...additionalWhere,
          username: {
            startsWith: options.searchQuery ?? Prisma.skip,
          },
        },

        include: {
          followers: {
            where: {
              id: requestorProfileId ?? -1,
            },
          },
        },

        orderBy: {
          followers: options.sortByFollowers
            ? {
                _count: options.order ?? Prisma.skip,
              }
            : Prisma.skip,
        },
      })
    );

    // transforming the result
    if (queryResult) {
      type TransformedResult = Profile & { followed: boolean };

      const transformedResult = Array<TransformedResult>();

      queryResult.forEach((i) => {
        transformedResult.push({ ...i, followed: i.followers.length > 0 });
        i.followers = [];
      });

      if (options.singleValue) {
        return [transformedResult, err];
      } else {
        return [transformedResult[0], err];
      }
    }

    return [null, err];
  }

  async getDetailsOfProfile(
    requestorProfileId: number,
    profileId: number,
    options: getDetailsOfProfileOptions
  ) {
    const [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.profile.findFirst({
        where: {
          id: profileId,
        },
        select: {
          posts: options.posts
            ? { include: this.postIncludeOptions(requestorProfileId) }
            : false,
          follows: options.follows,
          followers: options.followers,
          savedPosts: options.savedPosts
            ? { include: this.postIncludeOptions(requestorProfileId) }
            : false,
          notifications: options.notifications
            ? {
                include: {
                  notification: true,
                },
              }
            : false,
          contacts: options.contacts
            ? {
                include: {
                  contacted: true,
                  chat: {
                    include: {
                      messages: true,
                    },
                  },
                },
              }
            : false,
        },
      })
    );

    // transforming the result
    if (result && profileId) {
      result.posts = this.#transformPosts(result.posts);
      result.savedPosts = this.#transformPosts(result.savedPosts);

      return [result, err];
    }
    return [null, err];
  }

  async updateProfile(profileId: number, options: updateProfileOptions) {
    const [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.profile.update({
        where: {
          id: profileId,
        },
        data: {
          username: options.username ?? Prisma.skip,
          fullName: options.fullName ?? Prisma.skip,
          bio: options.bio ?? Prisma.skip,
          country: options.country ?? Prisma.skip,
          gender: options.gender ?? Prisma.skip,
          websiteUrl: options.websiteUrl ?? Prisma.skip,
          avatarUrl: options.avatarUrl ?? Prisma.skip,

          savedPosts: {
            connect: options.savePostId
              ? { id: options.savePostId }
              : Prisma.skip,
            disconnect: options.unsavePostId
              ? { id: options.unsavePostId }
              : Prisma.skip,
          },
          follows: {
            connect: options.followId ? { id: options.followId } : Prisma.skip,
            disconnect: options.unfollowId
              ? { id: options.unfollowId }
              : Prisma.skip,
          },
        },
      })
    );

    const typedResult: [typeof result | null, Error | null] = [result, err];
    return typedResult;
  }

  async getPosts(
    options: GetPostsOptions,
    requestorProfileId?: number
  ): Promise<[Post[] | Post | null, Error | null]> {
    const whereClause: { id?: number; fileType?: "IMAGE" | "VIDEO" } = {};
    if (options.postId) {
      whereClause.id = options.postId;
    }
    if (options.filter) {
      if (options.filter === "images") whereClause.fileType = "IMAGE";
      else if (options.filter === "videos") whereClause.fileType = "VIDEO";
    }

    let [queryResult, err] = await asyncHandler.prismaQuery(() =>
      prisma.post.findMany({
        where: { ...whereClause },

        orderBy: {
          likers: options.sortByLikes
            ? {
                _count: options.order,
              }
            : Prisma.skip,
        },
        skip: options.offset || 0,
        take: options.limit || this.#postsLimit,

        include: this.postIncludeOptions(requestorProfileId),
      })
    );

    const formattedResult = queryResult
      ? this.#transformPosts(queryResult)
      : null;

    if (options.singleValue) {
      if (Array.isArray(queryResult)) {
        return [queryResult[0], err];
      }
    }

    return [formattedResult, err];
  }

  async createPost(options: createPostOptions) {
    const [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.post.create({
        data: {
          content: options.content,
          imageUrl: options.fileUrl,
          publishDate: options.publishDate,
          fileType: options.fileType,
          authorId: options.authorId,
        },
      })
    );

    const typedResult: [typeof result | null, Error | null] = [result, err];
    return typedResult;
  }

  async deletePost(postId: number) {
    const [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.post.delete({
        where: {
          id: postId,
        },
      })
    );

    return [result, err]
  }

  async updatePost(postId: number, options: updatePostOptions) {
    const [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          content: options.content ?? Prisma.skip,
          imageUrl: options.imageUrl ?? Prisma.skip,
          likers: {
            connect: options.likerId ? { id: options.likerId } : Prisma.skip,
            disconnect: options.unlikerId
              ? { id: options.unlikerId }
              : Prisma.skip,
          },
        },
      })
    );

    return [result, err];
  }

  async createComment(postId: number, options: CreateCommentOptions) {
    const [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.comment.create({
        data: {
          content: options.content,
          publishDate: options.publishDate,
          postId: postId,
          authorId: options.authorId,
        },
      })
    );

    return [result, err];
  }

  async getComments(options: GetCommentsOptions) {
    const whereClause: { postId?: number } = {};
    if (options.postId) {
      whereClause.postId = options.postId;
    }

    const [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.comment.findMany({
        take: options.take || this.#commentsLimit,
        skip: options.offset || 0,
        include: {
          author: true,
        },
        where: { ...whereClause },
      })
    );

    return [result, err];
  }

  async createContact(options: CreateContactOptions) {
    const [chatResult, chatErr] = await asyncHandler.prismaQuery(() =>
      prisma.chat.create({})
    );
    if (!chatResult || chatErr) {
      return [null, chatErr];
    }

    const [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.contact.createMany({
        data: [
          {
            profileId: options.profileId,
            contactedId: options.contactedId,
            chatId: chatResult.id,
          },
          {
            profileId: options.contactedId,
            contactedId: options.profileId,
            chatId: chatResult.id,
          },
        ],
      })
    );

    return [result, err];
  }

  async getContacts(options: { profileId?: number }) {
    const whereClause: { profileId?: number } = {};
    if (options.profileId) {
      whereClause.profileId = options.profileId;
    }

    const [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.contact.findMany({
        where: { ...whereClause },
        include: {
          contacted: true,
        },
      })
    );

    return [result, err];
  }

  async createNotification(options: { type: NotificationType; title: string }) {
    const [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.notification.create({
        data: {
          type: options.type,
          title: options.title,
        },
      })
    );

    const typedResult: [typeof result | null, Error | null] = [result, err];
    return typedResult;
  }

  async pushNotificationToFollowers(profileId: number, notificationId: number) {
    const [result, err] = await asyncHandler.prismaQuery(
      () =>
        prisma.$queryRaw`SELECT push_notif_to_followers(${profileId}, ${notificationId})`
    );

    return [result, err];
  }

  /** @description Adds `liked` and `saved` fields and sets `likers` and `savers` to undefined */
  #transformPosts(posts: Post[]) {
    type TransformedPost = Flatten<typeof posts> & {
      liked: boolean;
      saved: boolean;
      likers: unknown;
      savers: unknown;
    };

    const transformedPosts = Array<TransformedPost>();

    posts.forEach((post) => {
      if ("likers" in post && "savers" in post) {
        if (Array.isArray(post.likers) && Array.isArray(post.savers)) {
          transformedPosts.push({
            ...post,
            liked: post.likers.length > 0,
            saved: post.savers.length > 0,
            savers: undefined,
            likers: undefined,
          });
        }
      }
    });

    return transformedPosts;
  }
}

const database = new Database();
export default database;
