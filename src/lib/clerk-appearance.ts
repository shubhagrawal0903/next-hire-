import type { Appearance } from "@clerk/types";

// Using CSS variables to ensure the Clerk theme adapts to the app's theme (Light/Dark)
// We rely on the global CSS variables defined in globals.css

export const clerkAppearance: Appearance = {
  variables: {
    // Primary Color (Zinc-900 or Zinc-50 based on mode)
    colorPrimary: "hsl(var(--primary))",

    // Backgrounds - Remove gradient, use solid background
    colorBackground: "hsl(var(--background))",
    colorInputBackground: "hsl(var(--background))",

    // Text
    colorText: "hsl(var(--text-primary))",
    colorTextSecondary: "hsl(var(--text-secondary))",
    colorInputText: "hsl(var(--text-primary))",

    // Borders
    borderColor: "hsl(var(--border))",
    borderRadius: "0.5rem", // rounded-lg

    // Fonts
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },

  elements: {
    // Root element - Remove gradient background
    rootBox: {
      background: "hsl(var(--background))",
    },

    // Main Card - Clean design
    card: {
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)", // shadow-sm
      border: "1px solid hsl(var(--border))",
      background: "hsl(var(--card))",
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
      color: "hsl(var(--text-primary))",
    },
    invitationMessageContainer: {
      backgroundColor: "hsl(var(--card))",
      borderColor: "hsl(var(--border))",
    },
    invitationMessageText: {
      color: "hsl(var(--text-secondary))",
    },

    // Additional elements for clean theme
    modalContent: {
      background: "hsl(var(--background))",
    },
    userButtonPopoverCard: {
      background: "hsl(var(--card))",
      borderColor: "hsl(var(--border))",
    },
  },
  
  layout: {
    socialButtonsPlacement: "bottom",
    socialButtonsVariant: "blockButton",
  },

  layout: {
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
    showOptionalFields: false,
  },
};