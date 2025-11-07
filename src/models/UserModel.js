/**
 * User Model
 * Handles all user-related data operations
 */

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export class UserModel {
  /**
   * Create a new user
   */
  static async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || "B2C",
        phone: data.phone,
        address: data.address,
      },
    });
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        businessName: true,
        phone: true,
        address: true,
        discount: true,
        createdAt: true,
      },
    });
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update user
   */
  static async update(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Get all B2B users
   */
  static async getAllB2BUsers() {
    return await prisma.user.findMany({
      where: {
        role: "B2B",
      },
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        phone: true,
        discount: true,
        createdAt: true,
      },
    });
  }

  /**
   * Update B2B discount
   */
  static async updateB2BDiscount(userId, discount) {
    return await prisma.user.update({
      where: { id: userId },
      data: { discount },
    });
  }
}
