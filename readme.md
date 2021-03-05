# Deploy to Expo Go

1. `expo publish`

# Deploy to App Store

1. Increment iOS build # in `./app.json`
1. `expo build:ios`
1. `eas submit --url=<artifacts URL from step 1>`
