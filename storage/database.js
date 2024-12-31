import { Prisma } from "@prisma/client";
import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../utils/prisma.js";

class Database {
  constructor() {}

  #profilesLimit = 10;
  #postsLimit = 7;
  #commentsLimit = 15;

  postIncludeOptions = (profileId = -1) => {
    return {
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
    };
  };

  async createAccount(options) {
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

  async getProfiles(requestorProfileId, options) {
    const additionalWhere = {};
    if (options.profileId) additionalWhere.id = options.profileId;

    let [result, err] = await asyncHandler.prismaQuery(() =>
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
                _count: options.order ?? -1,
              }
            : Prisma.skip,
        },
      })
    );

    result?.forEach((result) => {
      result.followed = false;
      if (result.followers.length > 0) {
        result.followed = true;
      }
      result.followers = undefined;
    });

    if (options.singleValue) {
      if (Array.isArray(result)) {
        result = result[0];
      }
    }

    return [result, err];
  }

  async getDetailsOfProfile(requestorProfileId, profileId, options) {
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

    result?.posts?.forEach((post) => {
      post.liked = false;
      post.saved = false;

      if (post.likers.length > 0) {
        post.liked = true;
      }
      if (post.savers.length > 0) {
        post.saved = true;
      }

      post.savers = post.likers = undefined;
    });
    result?.savedPosts?.forEach((post) => {
      post.liked = false;
      post.saved = false;

      if (post.likers.length > 0) {
        post.liked = true;
      }
      if (post.savers.length > 0) {
        post.saved = true;
      }

      post.savers = post.likers = undefined;
    });

    return [result, err];
  }

  async updateProfile(profileId, options) {
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

    return [result, err];
  }

  async getPosts(requestorProfileId, options) {
    const whereClause = {};
    if (options.postId) {
      whereClause.id = options.postId;
    }
    if (options.filter) {
      if (options.filter === "images") whereClause.fileType = "IMAGE";
      else if (options.filter === "videos") whereClause.fileType = "VIDEO";
    }

    let [result, err] = await asyncHandler.prismaQuery(() =>
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

    result?.forEach((post) => {
      post.liked = false;
      post.saved = false;

      if (post.likers.length > 0) {
        post.liked = true;
      }
      if (post.savers.length > 0) {
        post.saved = true;
      }

      post.savers = post.likers = undefined;
    });

    if (options.singleValue) {
      if (Array.isArray(result)) {
        result = result[0];
      }
    }

    return [result, err];
  }

  async createPost(requestorProfileId, options) {
    const [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.post.create({
        data: {
          content: options.content ?? Prisma.skip,
          imageUrl: options.fileUrl ?? Prisma.skip,
          publishDate: options.publishDate ?? Prisma.skip,
          fileType: options.fileType ?? Prisma.skip,
          authorId: options.authorId ?? Prisma.skip,
        },
      })
    );

    return [result, err];
  }

  async deletePost(postId, options) {
    const [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.post.delete({
        where: {
          id: postId,
        },
      })
    );
  }

  async updatePost(postId, options) {
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

  async createComment(postId, options) {
    const [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.comment.create({
        data: {
          content: options.content ?? Prisma.skip,
          publishDate: options.publishDate ?? Prisma.skip,
          postId: postId,
          authorId: options.authorId ?? Prisma.skip,
        },
      })
    );

    return [result, err];
  }

  async getComments(requestorProfileId, options) {
    const whereClause = {};
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

  async createContact(options) {
    const [chatResult, chatErr] = await asyncHandler.prismaQuery(() =>
      prisma.chat.create({})
    );
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

  async getContacts(options) {
    const whereClause = {};
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
  }

  async createNotification(options) {
    const [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.notification.create({
        data: {
          type: options.type,
          title: options.title,
        },
      })
    );

    return [result, err];
  }

  async pushNotificationToFollowers(profileId, notificationId) {
    const [result, err] = await asyncHandler.prismaQuery(
      () =>
        prisma.$queryRaw`SELECT push_notif_to_followers(${profileId}, ${notificationId})`
    );

    return [result, err];
  }
}

const database = new Database();
export default database;
