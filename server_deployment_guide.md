# Server Deployment Guide for Database Fixes

This guide walks through the exact steps to safely apply the `CCODE` duplicate fixes to the live Linux production server without modifying any other data or uploaded files.

## Prerequisites
- You must have the correct `update_ccodes_numbered.sql` file on your local machine (the one with the numbers, e.g., `NJHMN1`, not the letters).
- You must have SSH access to your Linux server (`deploy@CEY-KEY-APP`).

## Step 1: Open a blank file on the Server
SSH into your server and run this command to open the nano text editor:
```bash
nano /home/deploy/update_ccodes.sql
```

## Step 2: Paste the Correct Code
1. On your Windows computer, open **`update_ccodes_numbered.sql`**.
2. Press **Ctrl+A** (select all) and **Ctrl+C** (copy).
3. Switch back to your server terminal.
4. **Right-click** anywhere in the terminal to paste all 875 lines into the file.

## Step 3: Save and Exit
1. Press **Ctrl+O** (the letter O) to save.
2. Press **Enter** to confirm the filename.
3. Press **Ctrl+X** to exit the nano editor.

## Step 4: Run the Docker Command
Since the live server uses Docker, run this command to securely pipe the SQL file directly into the running Laravel backend container:
```bash
cat /home/deploy/update_ccodes.sql | docker exec -i celonica-web-backend php artisan tinker --execute="DB::unprepared(stream_get_contents(STDIN));"
```
*(If the command finishes quietly and returns you to the prompt without any red errors, it executed perfectly!)*

## Step 5: Clean Up
Once the database is updated successfully, safely remove the temporary SQL file from the server:
```bash
rm /home/deploy/update_ccodes.sql
```

## Verification
You can visually verify the fix on the live site. The duplicate CCODEs should now successfully reflect the numbered suffix (e.g., `NJHMN1`) just like your localhost.
