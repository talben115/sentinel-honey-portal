הנה קובץ README.md מעודכן ומלא באנגלית, מוכן להעתקה ל-GitHub, כולל לוגו ASCII אופציה 2 והוראות ההרצה המדויקות (npm install ו-npm run dev בפורט 3000):

Markdown
```text
 ██████╗ ███████╗███╗   ██╗████████╗██╗███╗   ██╗███████╗██╗     
██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██║████╗  ██║██╔════╝██║     
███████╗ █████╗  ██╔██╗ ██║   ██║   ██║██╔██╗ ██║█████╗  ██║     
╚════██╗ ██╔══╝  ██║╚██╗██║   ██║   ██║██║╚██╗██║██╔══╝  ██║     
███████║ ███████╗██║ ╚████║   ██║   ██║██║ ╚████║███████╗███████╗
╚══════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝
 ───[ H O N E Y  -  P O R T A L  //  C Y B E R - S O C ]───
🍯 Sentinel Honey-Portal & Cyber-SOC Control System
v3.1-STABLE | Control Center & Threat Monitoring Simulation

The Sentinel Honey-Portal is an advanced honeypot and cyber decoy platform designed to mislead attackers, gather real-time threat intelligence, and detect Brute Force attack attempts.

The portal presents a fake login interface for an enterprise finance system ("Kasfi System - Sentinel Industries"), captures the attacker's authentication attempts, and streams real-time events to a centralized SOC Control Dashboard powered by a NoSQL analytics engine.

🚀 Key Features
🎭 Fake Enterprise Login (SharePoint Honey-Portal): A spoofed authentication portal ("Kasfi System") designed to entice attackers into submitting credentials.

📊 Real-Time SOC Dashboard: Complete monitoring of all authentication attempts, including tracking external/internal IP addresses, targeted usernames, exposed passwords, and User-Agent signatures.

🛡️ Pattern Analysis Algorithm: Automated detection of Brute Force attacks based on a dynamic time window.

🔍 NoSQL JSON Explorer: An advanced data viewer for searching, filtering, and investigating security event logs.

🎯 Attack Simulator: A built-in module for simulating attack scenarios to validate detection mechanisms.

🔒 Lock Screen & Control Controls: Ability to lock the SOC dashboard interface, reset data, or load a demo dataset for testing.

🔍 Brute Force Detection Logic (Pattern Analysis Algorithm)
The SOC system continuously executes real-time NoSQL queries to detect anomalous attack patterns:

Plaintext
[ Incoming Login Event ]
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ Is Time Window <= 5 Minutes?                           │
│ AND                                                    │
│ (Same Username Attempts >= 3 OR Same IP Attempts >= 3) │
└─────────────────────────┬──────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
        [ YES ]                      [ NO ]
            │                           │
            ▼                           ▼
 Flag: BRUTE_FORCE               Flag: NORMAL
🛠️ Tech Stack & Architecture
Frontend: HTML5, CSS3, JavaScript (ES6+) / React

Backend / Database: Node.js, NoSQL Database Engine (Express / LocalStorage / MongoDB)

Network & Security Simulation: SSL Verification Simulation, IP Geolocation Mapping, User-Agent Parsing.

💻 Getting Started & Installation
Follow these steps to run the project locally on your machine.

Prerequisites
Node.js (v16.x or higher)

npm (comes bundled with Node.js)

Step-by-Step Setup
Clone the repository:

Bash
git clone [https://github.com/your-username/sentinel-honey-portal.git](https://github.com/your-username/sentinel-honey-portal.git)
cd sentinel-honey-portal
Install dependencies:

Bash
npm install
Start the development server:

Bash
npm run dev
Access the application:
Once started, the application will run on port 3000:

Honey-Portal (Attacker Decoy): http://localhost:3000

SOC Control Dashboard: http://localhost:3000/soc-admin

📸 System Overview
1. Honey-Portal Login Interface
Credential capture interface facing potential attackers:

Domain Context: username@sentinel.co.il

Target System: Sentinel Industries Corporate Finance System.

2. Control Center - Sentinel Cyber-SOC Control
Threat monitoring dashboard for security operators:

Metrics: Total login attempts, attacking IPs, targeted usernames, and Brute Force flags.

Live Logs: Detailed view of access attempts with automated threat tags (NORMAL / BRUTE_FORCE).

🧪 Running Attack Simulations
Access the SOC Control Dashboard at http://localhost:3000.

Click on "Attack Simulator" or "Load Demo Data".

Observe log entries transition from NORMAL to BRUTE_FORCE once 3 or more login attempts occur within a 5-minute window.

⚠️ Disclaimer
This project was developed strictly within a controlled lab environment (Sentinel Security Lab) for educational, research, and defensive threat hunting demonstrations. It should not be deployed in unauthorized environments.
