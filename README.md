# Health Information Management System (HIMS)

A secure, doctor-centric platform for managing healthcare programs and patient data.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

### 🔒 Secure Authentication System
- Role-based access control (Doctor-only access)
- Invitation-only account creation
- Audit logs for all account activities

### 🏥 Health Program Management
- Create and manage health programs (HIV, TB, Malaria, etc.)
- Track program status (Active/Inactive)
- View detailed program statistics
- Search and filter programs

### 👥 Client Management
- Register and manage patient profiles
- Enroll patients in multiple health programs
- Comprehensive client search functionality
- Detailed client profiles with program history

### 📊 Dashboard & Reporting
- Real-time system statistics
- Quick access to common actions
- Activity tracking and reporting

### 🔌 API Integration
- RESTful API for client data access
- Access control and monitoring
- Integration with external systems

## Installation

### Prerequisites
- Python 3.8+
- Django 3.2+
- PostgreSQL (recommended) or SQLite

### Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/HIMS.git
   cd HIMS
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Create superuser (first doctor account):
   ```bash
   python manage.py createsuperuser
   ```

7. Run development server:
   ```bash
   python manage.py runserver
   ```

## Usage

### Accessing the System
1. Navigate to `http://localhost:8000` in your browser
2. Login with your doctor credentials
3. Use the dashboard to manage programs and clients

### Adding New Doctors
1. Existing doctors can add new doctors via the admin interface
2. System generates audit logs for all new account creations

### Managing Clients
1. Register new clients via the "Clients" section
2. Enroll clients in appropriate health programs
3. View and edit client profiles as needed

## API Documentation

The system provides a REST API for accessing client data:

### Authentication
API access requires JWT authentication. Contact the system administrator for access tokens.



## Contact

Lewis Momanyi - [Lewis.nyakaru@gmail.com](mailto:Lewis.nyakaru@gmail.com)

---


Client Profile API - Integration Guide
🔐 Authentication
To access the API, you must authenticate using a JWT (JSON Web Token).

Step 1: Obtain API Credentials

client_id

client_secret

Auth endpoint (/api/auth/token/)

Step 2: Get Access Token
Send a POST request to generate a token:

Request:

http
POST /api/auth/token/
Content-Type: application/json

{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET"
}
Response:

json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600
}
📡 API Endpoint
Get Client Profile
Retrieve client details by their unique client_id.

Request:

http
GET /api/external/clients/{client_id}/
Authorization: Bearer YOUR_ACCESS_TOKEN
Path Parameter:

Field	Type	Description
client_id	string	Unique client identifier
Response (Success - 200 OK):

json
{
  "id": "12345",
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "age": 28,
  "address": "456 Health Ave, Nairobi",
  "programs": [
    {
      "program_id": "HIV-001",
      "program_name": "HIV Care",
      "enrollment_date": "2023-10-15"
    },
    {
      "program_id": "TB-005",
      "program_name": "Tuberculosis Treatment",
      "enrollment_date": "2023-11-20"
    }
  ],
  "metadata": {
    "created_at": "2023-10-10T08:30:00Z",
    "last_updated": "2024-01-05T14:25:00Z"
  }
}
Error Responses:

401 Unauthorized → Invalid/missing token

403 Forbidden → Insufficient permissions

404 Not Found → Client does not exist

🔒 Security & Monitoring
Each request is logged with:

Requesting application

IP address

Timestamp

Tokens expire after 1 hour (3600 seconds).

📝 Usage Example (Python)
python
import requests

# 1. Get Token
auth_url = "https://your-domain/api/auth/token/"
auth_data = {
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET"
}
token_response = requests.post(auth_url, json=auth_data)
access_token = token_response.json()["access_token"]

# 2. Fetch Client Data
client_id = "12345"
api_url = f"https://your-domain/api/external/clients/{client_id}/"
headers = {"Authorization": f"Bearer {access_token}"}

response = requests.get(api_url, headers=headers)
if response.status_code == 200:
    print(response.json())
else:
    print(f"Error: {response.status_code}")


