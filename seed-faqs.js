require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// We keep the old base intents
const baseIntents = [
    {
        "name": "Default Welcome Intent",
        "trainingPhrases": [
            "Hi",
            "Hello",
            "Hey",
            "Good morning",
            "Good evening"
        ],
        "response": "Welcome to Anurag University Student Support 🤝\nHow can I help you today?\n\nYou can ask about:\n• Admissions\n• Courses\n• Fee Structure\n• Placements\n• Exams & Results\n• Important Links & PDFs\n• Faculty Directory"
    },
    {
        "name": "University_Location",
        "trainingPhrases": [
            "Where is Anurag University located?",
            "University address",
            "Location of campus",
            "Where is the campus?"
        ],
        "response": "📍 Anurag University is located at:\nVenkatapur, Ghatkesar,\nMedchal–Malkajgiri District,\nHyderabad, Telangana – 500088."
    },
    {
        "name": "Courses_Offered",
        "trainingPhrases": [
            "What courses are offered?",
            "Available programs",
            "UG and PG courses",
            "Engineering branches"
        ],
        "response": "🎓 Anurag University offers:\n\n• B.Tech (CSE, AI & ML, IT, ECE, EEE, Mechanical, Civil, etc.)\n• M.Tech\n• MBA\n• Pharmacy Programs\n• Agriculture\n• Medical & Nursing\n• Ph.D Programs\n\nFor detailed syllabus and eligibility visit: https://www.anurag.edu.in/"
    },
    {
        "name": "Admissions_Process",
        "trainingPhrases": [
            "How to apply?",
            "Admission process",
            "How can I get admission?",
            "Apply for B.Tech"
        ],
        "response": "📝 Admission Process:\n\n• Apply through official website\n• Engineering admissions via EAPCET\n• Some courses through AnuragCET\n\nVisit Admissions Portal:\nhttps://www.anurag.edu.in/"
    },
    {
        "name": "Fee_Structure",
        "trainingPhrases": [
            "What is the fee structure?",
            "Course fees",
            "B.Tech fees",
            "MBA fees"
        ],
        "response": "💰 Fee structure varies by program and category.\nPlease check the official Admissions section or contact the admissions office for exact details.\n\nWebsite: https://www.anurag.edu.in/"
    },
    {
        "name": "Scholarships",
        "trainingPhrases": [
            "Are scholarships available?",
            "Scholarship details",
            "Merit scholarship",
            "Fee concession"
        ],
        "response": "🎓 Yes, Anurag University offers scholarships based on:\n• Merit\n• Entrance exam performance\n• Government schemes\n\nVisit the Scholarships section on the official website for full details."
    },
    {
        "name": "Placements",
        "trainingPhrases": [
            "Placement details",
            "Top recruiters",
            "Placement percentage",
            "Average package"
        ],
        "response": "💼 The university has a dedicated Training & Placement Cell.\nStudents receive training, internships, and campus placement opportunities.\n\nFor latest recruiters and statistics visit:\nhttps://www.anurag.edu.in/"
    },
    {
        "name": "Exam_Results",
        "trainingPhrases": [
            "Check results",
            "Exam results",
            "Semester results",
            "When will results be released?"
        ],
        "response": "📅 Exam results are published on the official results portal.\nPlease visit the Results section on the website to check your result."
    },
    {
        "name": "Hostel_Facilities",
        "trainingPhrases": [
            "Is hostel available?",
            "Hostel facilities",
            "Accommodation details",
            "Boys hostel",
            "Girls hostel"
        ],
        "response": "🏠 Yes, Anurag University provides hostel facilities for boys and girls.\nFacilities include mess, security, Wi-Fi, and transport.\n\nContact the campus administration for room availability."
    },
    {
        "name": "Contact_Information",
        "trainingPhrases": [
            "Contact details",
            "Admission contact number",
            "Phone number",
            "Email id"
        ],
        "response": "📞 You can contact Anurag University through the Contact Us section on the official website.\n\nWebsite: https://www.anurag.edu.in/"
    }
];

// New Information JSON Payload from the user
const newInfoPayload = {
    "important_links": {
        "academic_calendar": "https://anurag.edu.in/academic-calendar/",
        "notifications": "https://anurag.edu.in/notifications/",
        "faculty_directory": "https://anurag.edu.in/faculty-directory/",
        "student_affairs": "https://anurag.edu.in/student-affairs/",
        "international_college": "https://anurag.edu.in/anurag-university-international-college/",
        "library": "https://anurag.edu.in/library/",
        "iqac": "https://anurag.edu.in/iqac/",
        "research": "https://anurag.edu.in/research/"
    },
    "important_pdfs": [
        {
            "title": "Anurag University Prospectus",
            "year": "2024-25",
            "url": "https://anurag.edu.in/wp-content/uploads/2024/03/Anurag-University_Prospectus-FINAL.pdf"
        },
        {
            "title": "Innovations in Teaching & Learning (TLC)",
            "year": "2023",
            "url": "https://anurag.edu.in/wp-content/uploads/2023/04/TLC.pdf"
        },
        {
            "title": "AU IT Newsletter Volume 9-1",
            "year": "2021-22",
            "url": "https://anurag.edu.in/wp-content/uploads/2023/06/AU-IT-News-Letter-volume-9-1-2021-22.pdf"
        },
        {
            "title": "AU IT Newsletter Volume 9-2",
            "year": "2022",
            "url": "https://anurag.edu.in/wp-content/uploads/2023/06/AU-IT-Mag-vol-9-2-June-2022-30-jul.pdf"
        }
    ],
    "exam_notifications_structure": {
        "types": [
            "Regular End Semester Examinations",
            "Supplementary Examinations",
            "Revaluation Notifications",
            "Time Tables",
            "Results Announcements"
        ],
        "regulation_codes": ["R20", "R22", "R24"],
        "location": "https://anurag.edu.in/notifications/"
    },
    "faculty": {
        "School_of_Engineering": {
            "Computer_Science_and_Engineering": [
                { "name": "S. Deepika", "designation": "Assistant Professor" },
                { "name": "P. Aparna", "designation": "Assistant Professor" },
                { "name": "T. Srikanth", "designation": "Assistant Professor" },
                { "name": "Rama Mrudula", "designation": "Assistant Professor" },
                { "name": "V. Ramakrishna", "designation": "Assistant Professor" },
                { "name": "G. Swapna", "designation": "Assistant Professor" }
            ],
            "Electronics_and_Communication_Engineering": [
                { "name": "Ch. V. Ravi Teja", "designation": "Assistant Professor" },
                { "name": "M. Shiva Kumar", "designation": "Assistant Professor" },
                { "name": "G. Ashwini", "designation": "Assistant Professor" },
                { "name": "Dr. N. Mangala Gouri", "designation": "Associate Professor" },
                { "name": "Dr. V. Gurumurthy", "designation": "Professor" }
            ],
            "Information_Technology": [
                { "name": "Dr. M. S. Hema", "designation": "Professor" },
                { "name": "B. Namratha", "designation": "Assistant Professor" },
                { "name": "Dr. K. B. Raju", "designation": "Associate Professor" },
                { "name": "V. Krishna", "designation": "Assistant Professor" }
            ],
            "Artificial_Intelligence": [
                { "name": "Prof. Syeda Sameen Fatima", "designation": "Professor" },
                { "name": "P. Archana", "designation": "Assistant Professor" },
                { "name": "N. Poorna Chandra Rao", "designation": "Assistant Professor" }
            ],
            "Civil_Engineering": [
                { "name": "Faculty List Available", "source": "https://anurag.edu.in/faculty-directory/" }
            ],
            "Mechanical_Engineering": [
                { "name": "Faculty List Available", "source": "https://anurag.edu.in/faculty-directory/" }
            ]
        }
    },
    "student_support_units": [
        "Training and Placement Cell",
        "Student Affairs Office",
        "Examination Branch",
        "Internal Quality Assurance Cell (IQAC)",
        "Research & Development Cell",
        "Library Services"
    ],
    "regulations_document": {
        "title": "Academic Regulations for B.Tech (2025-26)",
        "established_under": "Telangana State Private Universities Act No.13, 2020",
        "duration_regular_years": 4,
        "max_duration_regular_years": 6,
        "total_credits_regular": 160,
        "grading_scale": "10-point absolute grading",
        "minimum_cgpa_for_degree": 5.0,
        "minimum_attendance_percentage": 75,
        "gpa_formula": "GPA = Σ(Ci × Gi) / Σ(Ci)",
        "percentage_conversion_formula": "Percentage = (CGPA - 0.5) × 10"
    },
    "academics": {
        "academic_calendar": {
            "BTech_semesters": [
                "Almanac for Academic Year 2025-26 – B.Tech I Year I & II Semesters",
                "Almanac for Academic Year 2025-26 – B.Tech II, III, IV Years I & II Semesters"
            ],
            "MTech_semesters": [
                "Almanac for Academic Year 2025-26 – M.Tech I Year I & II Semesters",
                "Almanac for Academic Year 2025-26 – M.Tech II Year I & II Semesters"
            ],
            "Pharmacy_semesters": [
                "Almanac for Academic Year 2025-26 – B.Pharmacy I Year I & II Semesters",
                "Almanac for Academic Year 2025-26 – M.Pharmacy I & II Years I & II Semesters",
                "Almanac for Academic Year 2025-26 – Pharm.D I to VI Years"
            ],
            "agriculture_semesters": [
                "Almanac for Academic Year 2025-26 – B.Sc. Agriculture (Hons.) I to IV Years"
            ],
            "management_semesters": [
                "Almanac for Academic Year 2025-26 – MBA I & II Years",
                "Almanac for Academic Year 2025-26 – BBA I to III Years"
            ],
            "nursing_semesters": [
                "Almanac for Academic Year 2025-26 – B.Sc Nursing I to III Years"
            ],
            "MCA_semesters": [
                "Almanac for Academic Year 2025-26 – MCA I & II Years"
            ],
            "source": "https://anurag.edu.in/academic-calendar/"
        },
        "timetables": {
            "exam_timetable_links": [
                "R22 B.Tech IV Year I-Semester End Examinations Timetable 2025",
                "R24 B.Tech II Year I Semester End Examinations Timetable 2025",
                "Multiple Supplementary & Midterm Timetables (R20, R22, R24, R15, R18)",
                "B.Tech Honors & Minor End Examinations Timetable"
            ],
            "base_url": "https://anurag.edu.in/time-table/"
        },
        "notifications": {
            "exam_notifications_pdf": [
                "One Time Chance Examinations Notifications – 2024",
                "R23 First MBBS Supplementary Examinations Notification – 2024",
                "Multiple R22 & R24 B.Sc (Nursing) Regular & Supplementary Notices",
                "Multiple R21 & R24 B.Sc (Hons) Agriculture Notifications"
            ],
            "source": "https://anurag.edu.in/notifications/"
        },
        "academic_regulations": {
            "documents": [
                "Academic Regulations for B.Tech Programs (AU-R24, AU-R22, AU-R20)",
                "Academic Regulations for M.Tech Programs (AU-R24, AU-R21)",
                "Academic Regulations for BBA, MBA, MCA, Pharmacy Programs",
                "Ph.D Program Academic Regulations (AU-R24, AU-R21)"
            ],
            "source": "https://anurag.edu.in/academic-regulations/"
        }
    }
};

// Convert the new JSON payload into database rows
const generatedIntents = [];

// 1. Important Links
generatedIntents.push({
    question: "Important links, academic calendar, notifications, faculty directory, student affairs, library, iqac, research, international college",
    answer: "🔗 Here are important Anurag University links:\n• Academic Calendar: " + newInfoPayload.important_links.academic_calendar + "\n• Notifications: " + newInfoPayload.important_links.notifications + "\n• Faculty Directory: " + newInfoPayload.important_links.faculty_directory + "\n• Library: " + newInfoPayload.important_links.library + "\n• Student Affairs: " + newInfoPayload.important_links.student_affairs + "\n• Research: " + newInfoPayload.important_links.research,
    category: "Important_Links"
});

// 2. Important PDFs
const pdfList = newInfoPayload.important_pdfs.map(pdf => `• ${pdf.title} (${pdf.year}): ${pdf.url}`).join('\n');
generatedIntents.push({
    question: "Prospectus, IT newsletter, TLC, teaching learning center, important pdfs, university documents",
    answer: "📄 Important University Documents & PDFs:\n\n" + pdfList,
    category: "Important_PDFs"
});

// 3. Exam Notifications
generatedIntents.push({
    question: "Exam types, supplementary exams, revaluation, time tables, results announcements, R20, R22, R24 regulations",
    answer: "📝 Exam Notifications & Structure:\n\nTypes of Exams:\n• Regular End Semester Examinations\n• Supplementary Examinations\n• Revaluation Notifications\n• Time Tables & Results\n\nRegulation Codes: R20, R22, R24\n\nCheck all updates here: " + newInfoPayload.exam_notifications_structure.location,
    category: "Exam_Notifications"
});

// 4. Faculty (CSE & IT)
const cseFaculty = newInfoPayload.faculty.School_of_Engineering.Computer_Science_and_Engineering.map(f => `• ${f.name} (${f.designation})`).join('\n');
const itFaculty = newInfoPayload.faculty.School_of_Engineering.Information_Technology.map(f => `• ${f.name} (${f.designation})`).join('\n');
generatedIntents.push({
    question: "CSE faculty, IT faculty, computer science professors, information technology teachers, who teaches CSE",
    answer: "👨‍🏫 Faculty - CSE & IT Departments:\n\n**Computer Science (CSE):**\n" + cseFaculty + "\n\n**Information Technology (IT):**\n" + itFaculty + "\n\nFor the full list, visit: https://anurag.edu.in/faculty-directory/",
    category: "Faculty_CSE_IT"
});

// 5. Faculty (ECE & AI)
const eceFaculty = newInfoPayload.faculty.School_of_Engineering.Electronics_and_Communication_Engineering.map(f => `• ${f.name} (${f.designation})`).join('\n');
const aiFaculty = newInfoPayload.faculty.School_of_Engineering.Artificial_Intelligence.map(f => `• ${f.name} (${f.designation})`).join('\n');
generatedIntents.push({
    question: "ECE faculty, AI faculty, electronics professors, artificial intelligence teachers, who teaches ECE",
    answer: "👨‍🏫 Faculty - ECE & AI Departments:\n\n**Electronics (ECE):**\n" + eceFaculty + "\n\n**Artificial Intelligence (AI):**\n" + aiFaculty + "\n\nFor the full list, visit: https://anurag.edu.in/faculty-directory/",
    category: "Faculty_ECE_AI"
});

// 6. Student Support Units
generatedIntents.push({
    question: "Student support units, placement cell, IQAC, examination branch, library services, R&D cell",
    answer: "🏢 Student Support Units at Anurag University:\n\n" + newInfoPayload.student_support_units.map(u => `• ${u}`).join('\n'),
    category: "Student_Support"
});

// 7. Academic Regulations B.Tech
const reg = newInfoPayload.regulations_document;
generatedIntents.push({
    question: "B.tech regulations, grading scale, CGPA to percentage, attendance requirement, total credits, promotion rules",
    answer: `📚 Academic Regulations for B.Tech (2025-26):

• Duration: Normal ${reg.duration_regular_years} years (Max ${reg.max_duration_regular_years} years)
• Total Credits Required: ${reg.total_credits_regular}
• Minimum Attendance: ${reg.minimum_attendance_percentage}%
• Grading Scale: ${reg.grading_scale}
• Min CGPA for Degree: ${reg.minimum_cgpa_for_degree}

🔢 Formulas:
• ${reg.gpa_formula}
• ${reg.percentage_conversion_formula}`,
    category: "BTech_Regulations"
});

// 8. Academic Almanacs / Calendars
generatedIntents.push({
    question: "Almanac, Btech academic calendar, Mtech calendar, MBA calendar, pharmacy calendar, semester dates",
    answer: "📅 Academic Calendars (Almanacs) are available for all branches including B.Tech, M.Tech, Pharmacy, MBA, MCA, Nursing, and Agriculture.\n\nYou can find the detailed semester schedules here:\n" + newInfoPayload.academics.academic_calendar.source,
    category: "Academic_Almanac"
});

// 9. Timetables
const ttLinks = newInfoPayload.academics.timetables.exam_timetable_links.map(t => `• ${t}`).join('\n');
generatedIntents.push({
    question: "Timetables, mid exam timetable, end semester exams dates, supplementary timetable, class timetable",
    answer: "⏳ Exam Timetables:\n\nRecent updates include:\n" + ttLinks + "\n\nCheck official timetables at:\n" + newInfoPayload.academics.timetables.base_url,
    category: "Timetables"
});

const legacyMapped = baseIntents.map(intent => ({
    question: intent.trainingPhrases.join(', ') || intent.name,
    answer: intent.response,
    category: intent.name
}));

const allFaqs = [...legacyMapped, ...generatedIntents];

async function seedData() {
    console.log('Deleting old FAQs...');
    await supabase.from('faqs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Inserting expanded JSON intents into database...');

    const { error } = await supabase.from('faqs').insert(allFaqs);

    if (error) {
        console.error('Failed to insert FAQs:', error);
    } else {
        console.log(`Successfully seeded ${allFaqs.length} intents into the knowledge base!`);
    }
}

seedData();
