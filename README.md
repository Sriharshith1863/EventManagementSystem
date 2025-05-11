# Getting Started

1. Navigate to the project directory:
   ```bash
   cd Evnt
   ```

2. Install the required packages:
   ```bash
   npm install
   ```

3. Run the front-end development server:
   ```bash
   npm run dev
   ```

4. Navigate to backend folder:
```bash
   cd backend
   ```

5.
Run the backend-end development server:
   ```bash
   nodemon server.js
   ```

---

## Restore PostgreSQL Database

To restore the database from the dump file, use the following command:

```bash
psql -U your_username -d your_new_db_name -f backend/db/db_dump.sql
```

## Note

Update the database credentials with your own in the `server.js` file before running the server.


## Contributors
- [Sriharshith](https://github.com/Sriharshith1863)
- [Rana Bharath](https://github.com/ranabharath)
- [Koushik](https://github.com/koushik-267)
- [Srichetan](https://github.com/Srichetan05)
- [Khaled](https://github.com/KHALED2437)