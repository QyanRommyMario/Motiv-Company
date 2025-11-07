/**
 * B2BRequest Model
 * Handles B2B request operations
 */

import prisma from "@/lib/prisma";

export class B2BRequestModel {
  /**
   * Create B2B request
   */
  static async create(data) {
    return await prisma.b2BRequest.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get all requests
   */
  static async getAll(options = {}) {
    const { status, skip = 0, take = 20 } = options;

    const where = {};
    if (status) {
      where.status = status;
    }

    return await prisma.b2BRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  }

  /**
   * Get request by user ID
   */
  static async findByUserId(userId) {
    return await prisma.b2BRequest.findUnique({
      where: { userId },
    });
  }

  /**
   * Update request status
   */
  static async updateStatus(id, status) {
    return await prisma.b2BRequest.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Approve request
   */
  static async approve(id, discount = 0) {
    const request = await prisma.b2BRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new Error("Pengajuan tidak ditemukan");
    }

    // Update request status
    await this.updateStatus(id, "APPROVED");

    // Update user role to B2B
    await prisma.user.update({
      where: { id: request.userId },
      data: {
        role: "B2B",
        status: "ACTIVE",
        businessName: request.businessName,
        phone: request.phone,
        address: request.address,
        discount,
      },
    });

    return request;
  }

  /**
   * Reject request
   */
  static async reject(id) {
    return await this.updateStatus(id, "REJECTED");
  }
}
