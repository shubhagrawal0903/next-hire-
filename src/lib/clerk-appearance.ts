import type { Appearance } from "@clerk/types";

// Using CSS variables to ensure the Clerk theme adapts to the app's theme (Light/Dark)
// We rely on the global CSS variables defined in globals.css

export const clerkAppearance: Appearance = {
  variables: {
    // Primary Color (Zinc-900 or Zinc-50 based on mode)
    colorPrimary: "hsl(var(--primary))",

    // Backgrounds
    colorBackground: "hsl(var(--card))",
    colorInputBackground: "hsl(var(--background))",

    // Text
    colorText: "hsl(var(--foreground))",
    colorTextSecondary: "hsl(var(--muted-foreground))",
    colorInputText: "hsl(var(--foreground))",

    // Borders
    borderColor: "hsl(var(--border))",
    borderRadius: "0.75rem", // rounded-xl

    // Fonts
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },

  elements: {
    // Main Card
    card: {
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", // shadow-md
      border: "1px solid hsl(var(--border))",
    },

    // Header
    headerTitle: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "hsl(var(--foreground))",
    },
    headerSubtitle: {
      color: "hsl(var(--muted-foreground))",
    },

    // Social Buttons (Google, GitHub, etc.)
    socialButtonsBlockButton: {
      borderColor: "hsl(var(--border))",
      backgroundColor: "hsl(var(--background))",
      color: "hsl(var(--foreground))",
      "&:hover": {
        backgroundColor: "hsl(var(--accent))",
      },
    },
    socialButtonsBlockButtonText: {
      fontWeight: "500",
    },

    // Divider
    dividerLine: {
      background: "hsl(var(--border))",
    },
    dividerText: {
      color: "hsl(var(--muted-foreground))",
    },

    // Form Inputs
    formFieldLabel: {
      color: "hsl(var(--foreground))",
      fontWeight: "500",
    },
    formFieldInput: {
      borderColor: "hsl(var(--input))",
      backgroundColor: "hsl(var(--background))",
      color: "hsl(var(--foreground))",
      "&:focus": {
        borderColor: "hsl(var(--ring))",
        boxShadow: "0 0 0 2px hsl(var(--ring))", // Ring effect
      },
    },

    // Primary Button
    formButtonPrimary: {
      backgroundColor: "hsl(var(--primary))",
      color: "hsl(var(--primary-foreground))",
      textTransform: "none",
      fontSize: "0.875rem",
      fontWeight: "600",
      "&:hover": {
        backgroundColor: "hsl(var(--primary) / 0.9)",
      },
      "&:active": {
        transform: "translateY(0px)",
      },
    },

    // Footer / Links
    footerActionLink: {
      color: "hsl(var(--primary))",
      fontWeight: "500",
      "&:hover": {
        textDecoration: "underline",
      },
    },
    identityPreviewText: {
      color: "hsl(var(--foreground))",
    },
    invitationMessageContainer: {
      backgroundColor: "hsl(var(--secondary))",
      borderColor: "hsl(var(--border))",
    },
    invitationMessageText: {
      color: "hsl(var(--secondary-foreground))",
    },
  },

  layout: {
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
    showOptionalFields: false,
  },
};