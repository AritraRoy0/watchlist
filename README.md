This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Pseudocode Documentation

### Module 1: Login

```text
BEGIN
  INPUT email
  INPUT password

  IF email is empty OR password is empty THEN
    DISPLAY "Email and password are required."
  ELSE IF credentials are valid THEN
    DISPLAY "Welcome to your watchlist!"
    REDIRECT to Home
  ELSE
    DISPLAY "Sorry, incorrect email or password. Try again."
  END IF
END
```

### Module 2: Add Item

```text
BEGIN
  INPUT title
  INPUT media_type (Movie or TV Show)
  INPUT platform (Netflix, Hulu, HBO Max, Disney+)
  INPUT status (Want to Watch or Watched) DEFAULT "Want to Watch"
  INPUT rating (optional)
  INPUT notes (optional)

  IF title is empty THEN
    DISPLAY "Please enter a title."
  ELSE IF media_type is not selected THEN
    DISPLAY "Please select a Movie or TV Show."
  ELSE IF platform is not selected THEN
    DISPLAY "Please select a platform."
  ELSE IF rating is provided AND (rating < 1 OR rating > 5) THEN
    DISPLAY "Rating must be between 1 and 5."
  ELSE
    ADD item to watchlist
    DISPLAY "Item successfully saved!"
  END IF
END
```

### Module 3: Update Item Status

```text
BEGIN
  INPUT item_id
  INPUT status (Want to Watch or Watched)

  IF item_id is invalid THEN
    DISPLAY "Item not found."
  ELSE IF status is not selected THEN
    DISPLAY "Please select Want to Watch or Watched."
  ELSE
    UPDATE item status in watchlist
    DISPLAY "Status updated successfully!"
  END IF
END
```

### Module 4: Delete Item

```text
BEGIN
  INPUT item_id
  DISPLAY "Are you sure you want to remove this item from My Watchlist?"
  INPUT confirmation (YES or NO)

  IF confirmation = "YES" THEN
    DELETE item from My Watchlist
    DISPLAY "Item deleted!"
  ELSE
    DISPLAY "Deletion cancelled."
  END IF
END
```

### Module 5: Filter Watchlist

```text
BEGIN
  INPUT status_filter (All, Want to Watch, Watched)
  INPUT type_filter (All, Movie, TV Show)

  IF status_filter = "All" AND type_filter = "All" THEN
    DISPLAY all watchlist items
  ELSE
    DISPLAY items that match selected filters
      - status = status_filter (if not "All")
      - media_type = type_filter (if not "All")
  END IF
END
```

### Flow-Style Summary

```text
START
  -> Login
    -> valid credentials? yes -> Home
    -> no -> show error and retry
  -> Home Actions
    -> Add Item -> validate inputs -> save -> success message
    -> Update Status -> validate selection -> update -> success message
    -> Delete Item -> confirm YES/NO -> delete or cancel
    -> Filter Watchlist -> apply status/type filters -> display matching items
END
```
