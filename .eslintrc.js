module.exports = {
  extends: [
    "@joystream/eslint-config",
    'plugin:sonarjs/recommended',
  ],
  rules: {
    "@typescript-eslint/no-var-requires": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "no-useless-constructor": "off",
    "@typescript-eslint/naming-convention": [
      "warn",
      {
        "selector": "enumMember",
        "format": ["UPPER_CASE"]
      },
      {
        "selector": "variable",
        "modifiers": ["const"],
        "format": ["camelCase", "UPPER_CASE"],
        "leadingUnderscore": "allow"
      },
      {
        "selector": ["memberLike"],
        "format": ["camelCase"],
        "leadingUnderscore": "allow"
      },
    ],
    "sonarjs/cognitive-complexity": "warn",
    "sonarjs/no-identical-functions": "warn",
    "sonarjs/no-duplicate-string": "warn",
    "sonarjs/no-collapsible-if": "warn"
  },
  "overrides": [
    {
        "files": ["*.test.ts"],
        "rules": {
            "no-unused-expressions": "off"
        }
    }
  ]
}