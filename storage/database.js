import { Prisma } from "@prisma/client";
import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../utils/prisma.js";

class Database {
  constructor() {}

  #profilesLimit = 20;

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

  async getProfiles(requestorProfileId, options) {
    const additionalWhere = {};
    if (options.profileId) additionalWhere.id = options.profileId;

    let [result, err] = await asyncHandler.prismaQuery(() =>
      prisma.profile.findMany({
        take: options.limit || this.#profilesLimit,
        skip: options.offset ?? 0,

        orderBy: {
          followers: options.sortByFollowers
            ? {
                _count: options.order ?? Prisma.skip,
              }
            : Prisma.skip,
        },

        where: {
          ...additionalWhere,
          username: {
            startsWith: options.searchQuery ?? Prisma.skip,
          },
        },

        include: {
          followers: {
            where: {
              id: requestorProfileId,
            },
          },
        },
      })
    );

    result?.forEach((result) => {
      result.followed = false;
      if (result.followers.length > 0) {
        result.followed = true;
      }
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

    if (options.singleValue) {
      if (Array.isArray(result)) {
        result = result[0];
      }
    }

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
}

const database = new Database();
export default database;
