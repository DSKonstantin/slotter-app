# slotter-app

## Environments

The app now supports three environment presets:

- `development`
- `staging`
- `production`

Environment files live in:

- `.env.development`
- `.env.staging`
- `.env.production`

For local machine overrides, create one of:

- `.env.local`
- `.env.development.local`
- `.env.staging.local`
- `.env.production.local`

Local override files are ignored by git.

## Commands

Install dependencies:

```bash
npm install
```

Start by environment:

```bash
npm run start:dev
npm run start:staging
npm run start:prod
```

Run native builds by environment:

```bash
npm run ios:dev
npm run ios:staging
npm run ios:prod

npm run android:dev
npm run android:staging
npm run android:prod
```

Web:

```bash
npm run web:dev
npm run web:staging
npm run web:prod
```

## Notes

- `app.config.js` changes app name and native application id/package depending on the selected environment.
- `development` defaults to `http://localhost:3000/api/v1/`.
- If you run on a physical device or Android emulator, override development API URL in `.env.development.local`.
