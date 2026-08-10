# ⚠️ CLOUDPANEL ISOLATION SAFETY PROTOCOL

**Project:** Manish Property Consultant
**Constraint:** Another mission-critical production project is ALREADY RUNNING on this VPS.

> [!CAUTION]
> DO NOT EXECUTE ROOT-LEVEL CONFIGURATION CHANGES FOR THIS PROJECT WITHOUT VERIFYING THEY DO NOT AFFECT OTHER CLOUDPANEL SITES.

## Absolute Rules of Engagement

1. **Separate CloudPanel Sites:** This project MUST be deployed as TWO entirely new, separate CloudPanel sites (`manishpropertyconsultant.in` for Node.js, `api.manishpropertyconsultant.in` for Python).
2. **Separate Site Users:** Do not reuse the existing project's CloudPanel user.
3. **Separate Application Ports:** Do not blindly map to ports `3000` or `5000`. CloudPanel will allocate or you must assign unused ports explicitly to avoid crashing the existing app.
4. **No Global Nginx Modifications:** Do not SSH into the VPS and edit `/etc/nginx/nginx.conf` or equivalent global reverse proxy files. Let CloudPanel manage VHost configurations securely.
5. **No Global Process-Manager Modifications:** Do not install or modify PM2/Supervisor globally in a way that restarts the existing project. CloudPanel's isolated Passenger/Node instances must be used.
6. **No Shared Writable Directories:** The persistent storage for this project (e.g. `otp.db` via SQLite or CSV uploads) MUST be stored inside its own isolated application directory (`/home/<site-user>/app-data/`). Never read or write to `/tmp` in a shared manner.
7. **No Shared Databases:** Unless intentionally configured and isolated via schemas/roles, do not reuse the existing project's database instance. Use Supabase (preferred) or a dedicated isolated database.
8. **No Shared Environment Files:** Environment variables (`.env`) must remain strictly within the new `htdocs/manishpropertyconsultant.in` structures.

Failure to adhere to these rules will result in downtime for the other production tenant.
