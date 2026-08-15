# Blood Bank Management System (BBMS) - Presentation Outline

This document provides a slide-by-slide breakdown for your PowerPoint presentation. You can easily copy and paste this text into your PowerPoint template.

---

## Slide 1: Title Slide
**Title:** Digital Blood Bank Management System (BBMS)
**Subtitle:** System Analysis and Design Project
**Presented By:** 
- Md. Naimul Huqe Nahin (ID: 233014202)
- [Add Group Members Here]
**Course:** CSE3101 - Section 04
**Instructor:** Shah Jafor Sadeek Quaderi

---

## Slide 2: Introduction
**Title:** Introduction to BBMS
**Bullet Points:**
* **What is it?** A centralized digital platform that directly connects hospitals, public donors, and blood bank administrators.
* **The Goal:** To replace disjointed manual systems with an intelligent, algorithmic marketplace.
* **Key Features:** Real-time inventory tracking, AI-powered donor matching, and automated B2B hospital portals.

**Speaker Notes:** *Begin by introducing the BBMS as a modern digital solution meant to save lives by cutting down the time it takes to procure blood during emergencies.*

---

## Slide 3: Problem Statement
**Title:** The Problem Statement
**Bullet Points:**
* **Fragmented Supply Chains:** Healthcare networks currently rely on manual data entry and telephone-based requisitions.
* **Unreliable Sources:** 68.8% of people rely on asking friends or posting on Facebook groups during an emergency.
* **The "Golden Hour" Delay:** Lack of real-time inventory tracking leads to deadly delays in finding the right blood group when time is critical.
* **Information Silos:** Hospitals and isolated blood banks cannot communicate stock shortages efficiently.

**Speaker Notes:** *Emphasize how dangerous it is that people have to rely on Facebook groups when someone is dying. Manual systems are too slow.*

---

## Slide 4: Objective
**Title:** Project Objectives
**Bullet Points:**
* **Centralization:** Create a single digital marketplace for all blood inventory and donor data.
* **Speed:** Reduce procurement times from hours to seconds using automated algorithms.
* **B2B Integration:** Enable hospitals to order bulk blood supplies directly through a digital portal without making phone calls.
* **Accessibility:** Provide an Action-Oriented Chatbot so non-technical staff can query databases using natural language.

---

## Slide 5: Required Inputs & Corresponding Outputs
**Title:** System Inputs & Outputs
**Table/Split View:**

**Required Inputs:**
1. **Donor Registration Forms:** Name, Blood Group, Phone, GPS Location (City).
2. **Emergency Requisitions:** Target blood group, urgency level, and patient location.
3. **Admin Stock Entries:** Incoming blood units and expiry dates.
4. **Chatbot Queries:** Natural language text (e.g., "Do we have O+?").

**Corresponding Outputs:**
1. **Donor Outputs:** Auto-generated dynamic PDF Digital ID Cards.
2. **Emergency Outputs:** Table of eligible donors sorted by distance & automated SMS alerts.
3. **Admin Outputs:** AI Demand Forecasting charts and visual analytics.
4. **Chatbot Outputs:** Direct database answers in conversational text.

---

## Slide 6: Algorithms & Models Used
**Title:** Algorithms & Models
**Bullet Points:**
* **Haversine Formula (Spatial Matching):** Calculates the exact geographic distance (in kilometers) between a patient's city and registered donors using latitude and longitude coordinates.
* **Heuristic Demand Forecasting:** Analyzes historical transaction data to predict future inventory shortages and seasonal disease outbreaks (like Dengue).
* **NLP Keyword Parsing:** Uses Regex (Regular Expressions) to process natural language Chatbot queries, extract intent, and query the SQL database instantly.
* **Role-Based Access Control (RBAC):** Security model that isolates Public, Hospital, and Admin privileges.

**Speaker Notes:** *This is the most technical slide. Explain how the Haversine formula is the math behind the GPS Search feature, and how the Regex Chatbot is a faster, cheaper alternative to heavy LLMs.*

---

## Slide 7: High-Level Architecture (Diagram)
**Title:** High-Level System Architecture
**Visual:** *(Paste the "High-Level System Architecture" diagram from Section 7.8 of your Final Report here)*
**Key Takeaways:**
* Built on a 3-Tier Architecture.
* **Frontend:** Next.js & React (Admin UI, B2B Portal, Emergency Form).
* **Logic Layer:** Node/TypeScript (AI Matcher, Session Manager).
* **Database:** Supabase / PostgreSQL.

---

## Slide 8: Core Workflows (Activity Diagram)
**Title:** Workflow: B2B Hospital Orders
**Visual:** *(Paste the "Activity Diagram (B2B Hospital Order Workflow)" from Section 7.5 of your Final Report here)*
**Key Takeaways:**
* Demonstrates the logic flow when a Hospital requests bulk units.
* The system automatically checks the Stock Database, handles "Out of Stock" logic, and routes pending orders to the Admin for dispatch.

---

## Slide 9: Database Design (ERD)
**Title:** Entity Relationship Diagram
**Visual:** *(Paste the "ERD" from Section 7.9 of your Final Report here)*
**Key Takeaways:**
* The database is structured around the `STOCK` table.
* Shows the `1-to-Many` relationships between Donors (who supply stock) and Transactions (which request stock).

---

## Slide 10: Financial Feasibility
**Title:** Feasibility & Break-Even Point
**Visual:** *(Paste the "Break-Even Graph" from your report here)*
**Bullet Points:**
* **Total Operational Cost:** ~4.8M BDT (Backed by Function Point Analysis: 209 TAFP).
* **Total IT Hardware/Cloud Cost:** 880k BDT.
* **ROI:** 3.68% after 3 years.
* **Break-Even Point:** The project becomes profitable in **Year 3** (2.9 years).

---

## Slide 11: Conclusion
**Title:** Conclusion
**Bullet Points:**
* The BBMS successfully digitizes a highly inefficient medical supply chain.
* Protects patient data through strict RBAC security.
* Proactive inventory management via AI Forecasting prevents stockouts.
* **Final Result:** A scalable, modern platform that accelerates the time it takes to save a life.

**Speaker Notes:** *Thank the professor and open the floor for Q&A.*
