import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: ["backend/**", "graphify-out/**", ".omo/**", "public/**"],
  },
  {
    // React 19 (eslint-plugin-react-hooks v6) compiler rules. They flag pre-existing
    // idiomatic patterns (client-side data fetching, localStorage hydration, shadcn
    // carousel/use-mobile/sidebar) across the codebase. Downgraded to warnings until
    // a dedicated refactor addresses them; keep them visible rather than silenced.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
]

export default eslintConfig
