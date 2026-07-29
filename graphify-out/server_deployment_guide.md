# Pushing Database Fixes to Linux Server

Since your server database is also `form_builder_prod`, the absolute safest and fastest way is to copy the SQL file over SSH and run it. 

Follow these steps exactly in a **new terminal window on your local machine** (Windows Command Prompt or PowerShell).

### Step 1: Upload the SQL File to the Server
We will use the `scp` (secure copy) command to send the local SQL file to your Linux server. 

Replace `username` with your SSH username and `your_server_ip` with your server's IP address.
```bash
scp "c:\xampp\htdocs\Celonica Quecion web\update_ccodes_numbered.sql" username@your_server_ip:/tmp/
```
*(It will ask for your server SSH password, just type it in and press Enter).*

### Step 2: Log into your Linux Server
Now SSH into your server:
```bash
ssh username@your_server_ip
```

### Step 3: Execute the SQL File
Once you are logged into the Linux terminal, run the following PostgreSQL command to apply the updates to the `form_builder_prod` database.

*(If you use a specific database user like `postgres`, keep the `-U postgres` part. If you have a different database user, change it).*
```bash
psql -U postgres -d form_builder_prod -f /tmp/update_ccodes_numbered.sql
```
*(It will ask for your database password, type it in and hit Enter).*

> [!TIP]
> You will see a long list of `UPDATE 1` printed on the screen. This means the 1,632 queries are successfully changing only the duplicate rows.

### Step 4: Clean Up
Once it's done, you can safely delete the temporary SQL file from the server so it doesn't take up space:
```bash
rm /tmp/update_ccodes_numbered.sql
exit
```

> [!IMPORTANT]
> **Using a Control Panel?**
> If you don't like using the terminal and you have a control panel like **cPanel / Plesk / Forge** or **pgAdmin** installed on your server, you can simply open the `update_ccodes_numbered.sql` file on your Windows machine, copy all the text inside it, log into your server's database manager interface on your browser, paste the text into the SQL Query box, and hit Run!
