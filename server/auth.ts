import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import type { User, LoginRequest, CreateUserRequest } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d"; // 7 days
const BCRYPT_ROUNDS = 12;

export interface AuthRequest extends Request {
  user?: User;
}

// Authentication service class
export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  static generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  // Verify JWT token
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Login user
  static async login(loginData: LoginRequest): Promise<{ user: User; token: string } | null> {
    try {
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return null;
      }

      const isPasswordValid = await this.verifyPassword(loginData.password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      // Update last login
      await storage.updateUserLastLogin(user.id);

      const token = this.generateToken(user);
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      
      return { user: userWithoutPassword as User, token };
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  }

  // Create user (for admin use)
  static async createUser(userData: CreateUserRequest): Promise<User | null> {
    try {
      const hashedPassword = await this.hashPassword(userData.password);
      
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword as User;
    } catch (error) {
      console.error("Create user error:", error);
      return null;
    }
  }
}

// Middleware to authenticate requests
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = AuthService.verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Get fresh user data from database
    const user = await storage.getUserById(decoded.id);
    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    // Attach user to request (without password)
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword as User;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// Middleware to check specific roles
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}` 
      });
    }

    next();
  };
};

// Role-specific middleware
export const requireAdmin = requireRole("admin");
export const requireOfficeStaff = requireRole("admin", "office_staff");
export const requirePropertyManager = requireRole("admin", "office_staff", "property_manager");
export const requireTechnician = requireRole("admin", "office_staff", "technician");
export const requireInspector = requireRole("admin", "office_staff", "inspector");

// Multi-role middleware
export const requireStaffOrAbove = requireRole("admin", "office_staff", "property_manager");
export const requireTechnicianOrAbove = requireRole("admin", "office_staff", "technician", "inspector");