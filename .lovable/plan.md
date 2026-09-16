# Reliable authentication fix

## Goal
Make login and signup work reliably on the published site without depending on the browser reaching Supabase directly.

## Changes
- Route login and signup through the app's own secure server connection to Supabase.
- Return the authenticated session to the browser and store it through the existing Supabase session manager.
- Preserve automatic Passenger, Driver, and Admin role lookup and redirects.
- Remove the retry workaround that only hid the underlying connection failure.
- Keep clear messages for invalid credentials, duplicate accounts, weak passwords, and genuine service outages.

## Verification
- Confirm existing passenger, driver, and admin accounts are valid and correctly assigned.
- Test login and signup requests through the same-origin flow.
- Verify the app compiles and the login page remains usable on mobile and desktop.

## Technical details
Use TanStack server functions with validated input and a server-local Supabase publishable client. No service-role access or database-policy changes are required.
