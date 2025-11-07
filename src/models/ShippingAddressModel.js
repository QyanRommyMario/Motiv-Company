import prisma from "@/lib/prisma";

/**
 * ShippingAddress Model
 * Handles database operations for shipping addresses
 */
class ShippingAddressModel {
  /**
   * Create new shipping address
   */
  static async create(data) {
    return await prisma.shippingAddress.create({
      data,
    });
  }

  /**
   * Get user's shipping addresses
   */
  static async getUserAddresses(userId) {
    return await prisma.shippingAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  /**
   * Get address by ID
   */
  static async getById(id) {
    return await prisma.shippingAddress.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  /**
   * Get default address for user
   */
  static async getDefaultAddress(userId) {
    return await prisma.shippingAddress.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });
  }

  /**
   * Update address
   */
  static async update(id, data) {
    return await prisma.shippingAddress.update({
      where: { id },
      data,
    });
  }

  /**
   * Set address as default (unset others)
   */
  static async setAsDefault(id, userId) {
    // Unset all default addresses for user
    await prisma.shippingAddress.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    // Set this address as default
    return await prisma.shippingAddress.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  /**
   * Delete address
   */
  static async delete(id) {
    return await prisma.shippingAddress.delete({
      where: { id },
    });
  }

  /**
   * Count user addresses
   */
  static async countUserAddresses(userId) {
    return await prisma.shippingAddress.count({
      where: { userId },
    });
  }
}

export default ShippingAddressModel;
