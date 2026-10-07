# Bill Splitter 👋

A bill-splitting app with a playful encounter-like theme: a typewriter-effect dialog box, badges, and a step-by-step "party" flow guide you through logging a bill and splitting it between trainers (people). Built with [Expo](https://expo.dev) and Expo Router.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- Web browser (`npm run web`)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Project structure

This project uses [file-based routing](https://docs.expo.dev/router/introduction) rooted at `src/app`. Per this project's conventions:

- New route files are authored as `.jsx` (not `.tsx`); existing `.tsx` files don't need to be converted.
- Platform-specific behavior uses Expo/Metro's extension resolution (e.g. `app-tabs.tsx` vs `app-tabs.web.tsx`).
- Path alias `@/*` maps to `src/*`, and `@/assets/*` maps to `assets/`.

## Other setup steps

- To set up ESLint for linting, run `npm run lint` (`expo lint`), or follow the guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/).
- If you'd like to set up unit testing, follow the guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/) — there is no configured test runner in this repo yet.
- Learn more about the TypeScript setup in this template in the guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/).

## Learn more

To learn more about developing with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with the [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

**Note:** This project targets Expo SDK ~57. Expo's APIs change frequently between versions — check the versioned docs at https://docs.expo.dev/versions/v57.0.0/ before relying on remembered patterns.
