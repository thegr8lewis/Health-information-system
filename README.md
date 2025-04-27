# Health Information Management System (HIMS)

![Project Banner](https://via.placeholder.com/800x200?text=Health+Information+Management+System) <!-- Replace with actual banner image if available -->

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

### Endpoints
- `GET /api/external/clients/{client_id}/` - Retrieve client profile
- `GET /api/programs/` - List all health programs
- `GET /api/clients/` - List all clients (doctor access required)

### Authentication
API access requires JWT authentication. Contact the system administrator for access tokens.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Lewis Momanyi - [Lewis.nyakaru@gmail.com](mailto:Lewis.nyakaru@gmail.com)

Project Link: [https://github.com/yourusername/HIMS](https://github.com/yourusername/HIMS)

---

📌 **Note:** Replace placeholder URLs, images, and configuration details with your actual project information before publishing.
