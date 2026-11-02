import datetime
from sqlalchemy.orm import Session
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.department import Department, ComplaintCategory, CategoryDepartmentMapping
from app.models.complaint import Complaint, ComplaintStatusHistory, ComplaintComment
from app.models.notification import Notification, NotificationPreference
from app.utils.ticket_generator import generate_ticket_id

DEPARTMENTS = [
    {
        "name": "Department of Water Supply & Sewerage",
        "code": "DWSS",
        "description": "Responsible for municipal water distribution, potable supply pipelines, and urban sewerage infrastructure.",
        "jurisdiction": "Statewide",
        "contact_email": "water.support@jansahayak.gov.in",
    },
    {
        "name": "Department of Energy & Power",
        "code": "DEP",
        "description": "Regulates electrical grid distribution, transformers, power outages, and transmission safety.",
        "jurisdiction": "Statewide",
        "contact_email": "power.grievance@jansahayak.gov.in",
    },
    {
        "name": "Public Works Department (PWD)",
        "code": "PWD",
        "description": "Oversees roads, bridges, public buildings, and state highway maintenance.",
        "jurisdiction": "Statewide",
        "contact_email": "pwd.helpdesk@jansahayak.gov.in",
    },
    {
        "name": "Municipal Corporation & Sanitation",
        "code": "MCS",
        "description": "Handles solid waste management, civic cleanliness, stormwater drainage, and stray animal control.",
        "jurisdiction": "Urban/Municipal",
        "contact_email": "sanitation@jansahayak.gov.in",
    },
    {
        "name": "Department of Health & Family Welfare",
        "code": "DHF",
        "description": "Manages public health centers, state hospitals, epidemic control, and medical supplies.",
        "jurisdiction": "Statewide",
        "contact_email": "health.grievance@jansahayak.gov.in",
    },
    {
        "name": "Department of Transport",
        "code": "DOT",
        "description": "Public bus transit, road transport safety, regional transport offices (RTO), and licensing.",
        "jurisdiction": "Statewide",
        "contact_email": "transport.care@jansahayak.gov.in",
    },
    {
        "name": "Department of School Education",
        "code": "DSE",
        "description": "Public school facilities, teacher attendance, midday meal quality, and student amenities.",
        "jurisdiction": "Statewide",
        "contact_email": "education@jansahayak.gov.in",
    },
    {
        "name": "Food & Civil Supplies Department",
        "code": "FCSD",
        "description": "Targeted Public Distribution System (PDS), ration shop allocations, and consumer protection.",
        "jurisdiction": "Statewide",
        "contact_email": "ration.pds@jansahayak.gov.in",
    },
    {
        "name": "Department of Police & Public Safety",
        "code": "DPPS",
        "description": "Public law and order, police station assistance, citizen safety, and emergency response.",
        "jurisdiction": "Statewide",
        "contact_email": "safety.alerts@jansahayak.gov.in",
    },
    {
        "name": "Revenue & Land Administration",
        "code": "RLA",
        "description": "Land records, mutation, property title registration, and tehsil administration.",
        "jurisdiction": "Statewide",
        "contact_email": "revenue.records@jansahayak.gov.in",
    },
    {
        "name": "General Administration Department",
        "code": "GAD",
        "description": "Inter-departmental coordination, general civic inquiries, and ombudsman escalations.",
        "jurisdiction": "Statewide",
        "contact_email": "general.admin@jansahayak.gov.in",
    },
]

CATEGORIES = [
    ("Water Supply", "CAT_WATER", "Issues related to drinking water, pipe bursts, low pressure, and sewage contamination.", "Department of Water Supply & Sewerage"),
    ("Electricity", "CAT_POWER", "Power blackouts, faulty transformers, loose electric wires, and voltage fluctuations.", "Department of Energy & Power"),
    ("Roads & Infrastructure", "CAT_ROADS", "Potholes, broken asphalt, incomplete bridge works, missing footpaths.", "Public Works Department (PWD)"),
    ("Sanitation & Waste Management", "CAT_SANITATION", "Uncollected garbage, overflowing community bins, open gutters.", "Municipal Corporation & Sanitation"),
    ("Public Health", "CAT_HEALTH", "Hospital hygiene, lack of doctors/medicines, PHC issues, disease outbreaks.", "Department of Health & Family Welfare"),
    ("Public Transport", "CAT_TRANSPORT", "Bus delays, rash driving, bus stop conditions, metro connectivity.", "Department of Transport"),
    ("Education", "CAT_EDUCATION", "School building repairs, teacher vacancies, student welfare amenities.", "Department of School Education"),
    ("Municipal Services", "CAT_MUNICIPAL", "Streetlights not working, stray dogs, tree cutting, park maintenance.", "Municipal Corporation & Sanitation"),
    ("Public Distribution", "CAT_PDS", "Ration shop irregularities, grain quality complaints, ration card issues.", "Food & Civil Supplies Department"),
    ("Public Safety", "CAT_SAFETY", "Citizen security, illegal parking, lack of night patrols, harassment.", "Department of Police & Public Safety"),
    ("Revenue & Land Records", "CAT_REVENUE", "Delays in patta/khata certificates, land boundary disputes, tehsil work.", "Revenue & Land Administration"),
]


def seed_database(db: Session):
    # 1. Seed Departments
    dept_map = {}
    for d_data in DEPARTMENTS:
        dept = db.query(Department).filter(Department.code == d_data["code"]).first()
        if not dept:
            dept = Department(**d_data)
            db.add(dept)
            db.flush()
        dept_map[dept.name] = dept

    # 2. Seed Categories and Mappings
    for cat_name, cat_code, cat_desc, target_dept_name in CATEGORIES:
        cat = db.query(ComplaintCategory).filter(ComplaintCategory.code == cat_code).first()
        if not cat:
            cat = ComplaintCategory(name=cat_name, code=cat_code, description=cat_desc)
            db.add(cat)
            db.flush()

        dept = dept_map.get(target_dept_name)
        if dept:
            mapping = db.query(CategoryDepartmentMapping).filter(
                CategoryDepartmentMapping.category_id == cat.id,
                CategoryDepartmentMapping.department_id == dept.id,
            ).first()
            if not mapping:
                db.add(CategoryDepartmentMapping(category_id=cat.id, department_id=dept.id, routing_rank=1))

    # 3. Seed Demo Users
    demo_users = [
        {
            "email": "admin@jansahayak.gov.in",
            "password": "AdminPassword@2026",
            "full_name": "Rajesh Sharma (System Admin)",
            "language": "en",
            "role": "system_admin",
            "dept": None,
        },
        {
            "email": "head.water@jansahayak.gov.in",
            "password": "StaffPassword@2026",
            "full_name": "Dr. Sunita Deshmukh (Dept Head)",
            "language": "mr",
            "role": "department_head",
            "dept": "Department of Water Supply & Sewerage",
        },
        {
            "email": "officer.water@jansahayak.gov.in",
            "password": "StaffPassword@2026",
            "full_name": "Amit Verma (Field Officer)",
            "language": "hi",
            "role": "department_officer",
            "dept": "Department of Water Supply & Sewerage",
        },
        {
            "email": "citizen@jansahayak.gov.in",
            "password": "CitizenPassword@2026",
            "full_name": "Ramesh Kumar (Citizen)",
            "language": "hi",
            "role": "citizen",
            "dept": None,
        },
    ]

    citizen_user = None
    water_dept = dept_map.get("Department of Water Supply & Sewerage")

    for u_info in demo_users:
        user = db.query(User).filter(User.email == u_info["email"]).first()
        if not user:
            user = User(
                email=u_info["email"],
                hashed_password=hash_password(u_info["password"]),
                full_name=u_info["full_name"],
                preferred_language=u_info["language"],
                account_status="active",
            )
            db.add(user)
            db.flush()

            # Assign Role
            dept_id = dept_map[u_info["dept"]].id if u_info["dept"] and u_info["dept"] in dept_map else None
            role = UserRole(user_id=user.id, role=u_info["role"], department_id=dept_id)
            db.add(role)

            # Notification preferences
            pref = NotificationPreference(user_id=user.id, preferred_language=u_info["language"])
            db.add(pref)

        if u_info["role"] == "citizen":
            citizen_user = user

    # 4. Seed initial realistic demo complaints if none exist
    complaint_count = db.query(Complaint).count()
    if complaint_count == 0 and citizen_user and water_dept:
        now = datetime.datetime.now(datetime.timezone.utc)
        water_cat = db.query(ComplaintCategory).filter(ComplaintCategory.code == "CAT_WATER").first()

        c1 = Complaint(
            ticket_id="JSA-2026-W8491A",
            citizen_id=citizen_user.id,
            title="Severe pipeline leakage and low drinking water pressure",
            original_description="हमारे वार्ड नंबर 12 में पिछले 4 दिनों से मुख्य पाइपलाइन फटी हुई है और पीने के पानी का दबाव बेहद कम है। गंदा पानी भी आ रहा है। कृपया तुरंत मरम्मत करें।",
            original_language="hi",
            translated_description="In our Ward No. 12, the main drinking water pipeline has been ruptured for the past 4 days, resulting in extremely low water pressure and contaminated supply. Immediate repair is requested.",
            ai_summary="Citizen reported main drinking water pipeline rupture in Ward 12 for 4 days with low pressure and muddy water. Recommended action: Immediate line inspection and valve repair by Water Supply department.",
            category_id=water_cat.id if water_cat else None,
            assigned_department_id=water_dept.id,
            ai_suggested_department_id=water_dept.id,
            ai_confidence=0.94,
            ai_suggested_urgency="high",
            priority="high",
            status="in_progress",
            state="Maharashtra",
            district="Pune",
            locality="Ward 12, Shivaji Nagar",
            submitted_at=now - datetime.timedelta(days=2),
            due_at=now + datetime.timedelta(hours=24),
        )
        db.add(c1)
        db.flush()

        # Add history
        db.add(ComplaintStatusHistory(
            complaint_id=c1.id,
            previous_status="submitted",
            new_status="in_progress",
            changed_by=None,
            public_comment="Field maintenance crew dispatched for pipeline inspection.",
            created_at=now - datetime.timedelta(days=1),
        ))

        # Add public comment
        db.add(ComplaintComment(
            complaint_id=c1.id,
            body="Site inspection was completed by the water maintenance team. Replacement parts for the 8-inch valve have been requisitioned.",
            visibility="public",
            created_at=now - datetime.timedelta(hours=18),
        ))

    db.commit()
