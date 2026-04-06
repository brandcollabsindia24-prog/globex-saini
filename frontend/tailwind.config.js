/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        dark: {
          primary: "#0B0F19",
          secondary: "#1a1f2e",
          tertiary: "#252b3d",
          card: "rgba(20, 27, 42, 0.6)",
          border: "rgba(59, 130, 246, 0.1)",
          text: "#ffffff",
          "text-secondary": "#b0b9c8",
          "text-muted": "#7a8497",
        },
        accent: {
          blue: "#3B82F6",
          "blue-dark": "#1e40af",
          purple: "#8b5cf6",
          "purple-dark": "#6d28d9",
          cyan: "#06b6d4",
          pink: "#ec4899",
        },
      },
      backgroundImage: {
        "gradient-blue-purple": "linear-gradient(135deg, #3B82F6 0%, #8b5cf6 100%)",
        "gradient-purple-pink": "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
        "gradient-cyan-blue": "linear-gradient(135deg, #06b6d4 0%, #3B82F6 100%)",
        "glass-subtle": "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(59, 130, 246, 0.3)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.3)",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.3)",
      },
      borderColor: {
        glass: "rgba(59, 130, 246, 0.2)",
      },
    },
  },
  plugins: [],
};
