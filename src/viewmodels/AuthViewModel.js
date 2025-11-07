/**
 * Auth ViewModel
 * Handles authentication business logic
 */

import { UserModel } from "@/models/UserModel";

export class AuthViewModel {
  /**
   * Register new user
   */
  static async register(data) {
    try {
      // Validate input
      if (!data.name || !data.email || !data.password) {
        throw new Error("Semua field harus diisi");
      }

      // Check if email already exists
      const existingUser = await UserModel.findByEmail(data.email);
      if (existingUser) {
        throw new Error("Email sudah terdaftar");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error("Format email tidak valid");
      }

      // Validate password length
      if (data.password.length < 6) {
        throw new Error("Password minimal 6 karakter");
      }

      // Create user
      const user = await UserModel.create(data);

      return {
        success: true,
        message: "Registrasi berhasil",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Login user
   */
  static async login(email, password) {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error("Email dan password harus diisi");
      }

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        throw new Error("Email atau password salah");
      }

      // Verify password
      const isValid = await UserModel.verifyPassword(password, user.password);
      if (!isValid) {
        throw new Error("Email atau password salah");
      }

      return {
        success: true,
        message: "Login berhasil",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          discount: user.discount,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(userId) {
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        throw new Error("User tidak ditemukan");
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
