# You Party – I Pour

You Party – I Pour is a full-stack web application for a local mobile bartending and event services business.

The application provides customers with a polished, responsive experience for exploring services, viewing event media, checking event availability, and submitting booking requests. It also includes a protected administrative system for managing bookings, gallery content, event availability, confirmation emails, and administrator accounts.

The project is designed with an upscale, clean, and elegant visual direction while remaining practical and responsive across desktop and mobile devices.

---

## Features

### Public Experience

- Responsive Home page
- Services listing
- Individual service detail pages
- Gallery with image and video support
- About page
- Event quote request form
- Booking confirmation page
- Responsive slide-out navigation
- Mobile and desktop layouts
- Sticky-footer layout behavior

### Booking Requests

Customers can submit event booking requests containing:

- Name
- Email
- Phone number
- Event date
- Event start and end times
- Event type
- Event location
- Guest count
- Service package
- Additional event details

Each successful request receives a unique confirmation number.

### Availability Checking

Before submitting a request, customers can check whether their selected event date and time are available.

Availability considers:

- Existing confirmed bookings
- Reserved bookings
- Event time conflicts
- Administrator-created blackout dates

Unavailable dates or times prevent conflicting booking requests from being submitted.

### Email Confirmations

Booking requests support automated confirmation emails.

The system tracks email delivery status and allows administrators to resend confirmation emails when necessary.

Email status values include:

- Pending
- Sent
- Failed

### Admin Authentication

The application includes protected administrator authentication using JSON Web Tokens.

Administrators can:

- Sign in securely
- Access protected admin routes
- Sign out
- Create additional administrator accounts

Passwords are hashed before being stored in the database.

### Admin Dashboard

The Admin Dashboard provides an overview of booking activity, including:

- Total requests
- New requests
- Contacted requests
- Confirmed requests
- Declined requests
- Failed confirmation emails

Administrators can search, filter, and sort booking requests by:

- Customer name
- Email
- Confirmation number
- Booking status
- Email status
- Request creation order
- Event date

### Booking Management

Administrators can open individual booking requests to view:

- Customer information
- Event information
- Service selection
- Customer message
- Confirmation number
- Email status

Administrators can also:

- Update booking status
- Add internal admin notes
- Resend confirmation emails

Supported booking statuses include:

- New
- Contacted
- Confirmed
- Reserved
- Declined

### Admin Calendar

The protected admin calendar displays:

- Confirmed bookings
- Reserved bookings
- Event start and end times
- Blackout dates

Administrators can select calendar date ranges to create blackout periods and remove existing blackout dates.

### Gallery Management

The public Gallery supports:

- Images
- Videos
- Responsive media presentation

Authenticated administrators can:

- Upload gallery media
- Add titles
- Add descriptions
- Hide or show gallery items
- Permanently delete gallery items

Media files are stored using Cloudinary.

Video controls are configured for a streamlined gallery experience.

---

## Tech Stack

### Front End

- React
- Vite
- React Router
- JavaScript
- HTML
- CSS
- FullCalendar

### Back End

- Node.js
- Express
- PostgreSQL
- `pg`
- JSON Web Tokens
- bcrypt
- Nodemailer
- Multer
- Cloudinary
- CORS
- Morgan
- dotenv

### Development Tools

- Git
- GitHub
- npm
- ESLint
- VS Code

---

## Application Structure

The project is organized as a React client with a Node/Express backend at the repository root.

```text
you-party-i-pour/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── config/
├── controllers/
├── db/
├── docs/
├── middleware/
├── routes/
├── utils/
├── server.js
├── package.json
└── README.md
```

---

## Public Routes

| Route | Description |
| --- | --- |
| `/` | Home page |
| `/services` | Available services |
| `/services/:id` | Individual service details |
| `/gallery` | Public media gallery |
| `/about` | About the business |
| `/request-quote` | Booking request form |
| `/confirmation` | Booking confirmation |
| `/admin/login` | Administrator sign in |

---

## Admin Routes

| Route | Description |
| --- | --- |
| `/admin/dashboard` | Booking management dashboard |
| `/admin/bookings/:id` | Individual booking details |
| `/admin/calendar` | Booking and blackout calendar |
| `/admin/add-admin` | Create another administrator |

Administrative functionality relies on authenticated backend API routes using JWT authorization. Invalid or expired sessions require the administrator to sign in again.

---

## API Overview

### Authentication

```text
POST /auth/sign-in
```

That also matches the architecture you have now, because additional administrators are created through the protected:

```text
POST /api/admins
```


### Services

```text
GET /api/services
GET /api/services/:id
```

### Booking Requests

```text
POST  /api/booking-requests
POST  /api/booking-requests/availability
GET   /api/booking-requests
GET   /api/booking-requests/:id
PATCH /api/booking-requests/:id
PATCH /api/booking-requests/:id/notes
POST  /api/booking-requests/:id/resend-confirmation
```

### Gallery

```text
GET    /api/gallery
GET    /api/gallery/admin/all
POST   /api/gallery
PATCH  /api/gallery/:id
DELETE /api/gallery/:id
```

### Blackout Dates

```text
GET    /api/blackout-dates
POST   /api/blackout-dates
DELETE /api/blackout-dates/:id
```

### Administrators

```text
POST /api/admins
```

Public booking creation, availability checks, service retrieval,
and public gallery retrieval do not require authentication.

Administrative booking, gallery, blackout-date, and administrator
management routes require authentication. Gallery management and
administrator creation also use administrator-role authorization.

---

## Database

The application uses PostgreSQL for persistent data storage through the `pg` package and a connection pool configured with `DATABASE_URL`.

The current database includes the following core tables:

### `users`

Stores administrator accounts.

Key fields include:

- `username`
- `hashed_password`
- `role`
- `created_at`

Usernames are unique.

### `services`

Stores available service packages.

Key fields include:

- `name`
- `description`
- `price`
- `is_active`
- `created_at`

Booking requests reference services through `service_id`.

### `booking_requests`

Stores customer booking and event request data.

Key fields include:

- Customer name
- Email
- Phone
- Event date
- Event start and end times
- Event type
- Event location
- Guest count
- Selected service
- Customer message
- Booking status
- Unique confirmation number
- Email status
- Internal administrator notes
- Creation timestamp

New booking requests default to a status of `new`, while email delivery status defaults to `pending`.

### `gallery_items`

Stores gallery media metadata.

Key fields include:

- Title
- Description
- Media type
- Media URL
- Thumbnail URL
- Visibility status
- Cloudinary public ID
- Creation timestamp

Gallery media types are restricted to `image` or `video`.

### `blackout_dates`

Stores administrator-defined unavailable date ranges.

Key fields include:

- Start date
- End date
- Optional reason
- Creation timestamp

The database enforces that a blackout period cannot end before it begins.

---

## Authentication

Administrator authentication uses JSON Web Tokens.

After a successful administrator sign-in:

1. The server looks up the account by username.
2. The submitted password is verified using bcrypt.
3. A JWT containing the user's username, ID, and role is generated.
4. The token is returned to the React client.
5. The client stores the token in `localStorage`.
6. Protected API requests include the token in the `Authorization` header.

```text
Authorization: Bearer <token>
```

Expired or invalid sessions require the administrator to sign in again.


### `server.js` also confirms `dotenv` ✓

This:

```js
const dotenv = require('dotenv');
dotenv.config();
```


---

## Development Proxy

During local development, the React client uses Vite's proxy configuration to forward API requests to the Express server.

Frontend requests use relative paths such as:

```text
/api/services
/api/booking-requests
/api/gallery
/auth/sign-in
```

This prevents the React application from depending on hardcoded backend URLs and allows the same frontend request structure to work across desktop and mobile development environments.

---

## Responsive Design

The interface was designed and tested for both desktop and mobile screens.

The visual direction emphasizes:

- Clean layouts
- Restrained color usage
- Elegant typography
- Generous whitespace
- Transparent and text-focused controls
- Thin borders and subtle visual hierarchy
- Responsive media
- Consistent public and administrative design language

The navigation uses a bourbon-glass visual identity with a slide-out menu.

Gallery images and videos are displayed responsively without unnecessarily stretching the media.

---

## Local Development

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install server dependencies

From the project root:

```bash
npm install
```

### 3. Install client dependencies

```bash
cd client
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root.

```text
JWT_SECRET=
PORT=
DATABASE_URL=

MAILTRAP_HOST=
MAILTRAP_PORT=
MAILTRAP_USER=
MAILTRAP_PASS=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

These variables configure:

- `DATABASE_URL` — PostgreSQL connection
- `JWT_SECRET` — administrator authentication tokens
- `PORT` — Express server port
- `MAILTRAP_*` — confirmation email delivery
- `CLOUDINARY_*` — gallery image and video storage

Never commit `.env` files or secret credentials to version control.

### 5. Start the Express server

From the project root:

```bash
npm run dev
```

This runs the Express server with Nodemon during development.

To run the server without Nodemon:

```bash
npm start
```

### 6. Start the React client

From the `client` directory:

```bash
npm run dev
```

### 7. Verify the client

From the `client` directory:

```bash
npm run lint
npm run build
```

During development, Vite serves the React application while proxying API requests to the Express backend.

---

## Current Project Status

The application currently includes a functional full-stack booking workflow and responsive public and administrative interfaces.

Completed areas include:

- Public navigation and layout
- Responsive Home page
- Services and service details
- Responsive media gallery
- Quote request workflow
- Event availability checking
- Booking confirmation numbers
- Confirmation emails
- Administrator authentication
- Booking management dashboard
- Booking status management
- Internal admin notes
- Email resend functionality
- Gallery administration
- Admin calendar
- Blackout date management
- Responsive desktop and mobile design
- Relative frontend API routing through the Vite development proxy

---

## Planned Improvements

Potential future improvements include:

- Final brand logo integration
- Final branded photography and media
- Additional Home page showcase content
- Final About page content
- Additional service offerings
- Further accessibility testing
- Production deployment configuration
- Additional automated testing

---

## Author

**Eli Rodriguez**

Full-stack web development project.