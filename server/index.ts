import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import { storage } from "./storage";
import { startDiscordBot } from "./discord-bot";
import { 
  securityHeaders, 
  sanitizeInput, 
  apiLimiter,
  errorHandler 
} from "./middleware/security";

// Augment express-session types
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    rememberMe?: boolean;
    loginTime?: number;
    oauthState?: string;
    pendingRememberMe?: boolean;
  }
}

// Set default Discord Client ID if not provided
if (!process.env.DISCORD_CLIENT_ID) {
  process.env.DISCORD_CLIENT_ID = "1372226433191247983";
}

const app = express();
// Security middleware
  app.use(securityHeaders);
  app.use(sanitizeInput);
  app.use('/api/', apiLimiter);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));


  // Error handling
  app.use(errorHandler);


// Require strong session secret in production
if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('SESSION_SECRET environment variable is required in production');
}

// Configure trust proxy for proper protocol detection
app.set('trust proxy', 1);

// Session middleware with secure persistent login support
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
  resave: false,
  saveUninitialized: true, // Changed to true to ensure session is created for OAuth state
  cookie: {
    secure: false, // Disabled for development - Replit uses HTTP in dev
    maxAge: 7 * 24 * 60 * 60 * 1000, // Default: 7 days for regular sessions
    httpOnly: true, // Better security - prevents XSS attacks
    sameSite: 'lax' // CSRF protection
  },
  rolling: true, // Extend session on each request
  name: 'smart-serve-session' // Custom session name
}));

// Enhanced user authentication middleware with auto-login
app.use(async (req, res, next) => {
  if (req.session?.userId) {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        req.user = {
          id: user.id,
          discordId: user.discordId,
          username: user.username,
          avatar: user.avatar ?? undefined,
          isAdmin: user.isAdmin ?? undefined,
          coins: user.coins ?? 0
        };
        
        // Update last activity for security tracking
        if (!req.session.loginTime) {
          req.session.loginTime = Date.now();
        }
        
        // Extend session for persistent login if remember me was enabled
        if (req.session.rememberMe) {
          req.session.cookie.maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days for remember me
        } else {
          req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days for regular sessions
        }
      } else {
        // User no longer exists, clear session
        req.session.destroy(() => {});
      }
    } catch (error) {
      console.error('Error loading user:', error);
      // Clear invalid session on error
      req.session.destroy(() => {});
    }
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        // Truncate the JSON response if it's too long
        const jsonString = JSON.stringify(capturedJsonResponse);
        logLine += ` :: ${jsonString.length > 80 ? jsonString.slice(0, 77) + "…" : jsonString}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Start Discord bot for economy rewards
  startDiscordBot();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    // Log the error for debugging purposes
    console.error(err);
    // Rethrowing the error might not be necessary here as we've already sent a response.
    // Depending on the desired behavior, you might want to remove the throw.
    // For now, keeping it to potentially allow higher-level error handling if any.
    // throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();