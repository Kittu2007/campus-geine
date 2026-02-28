require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const data = {
    "intents": [
        {
            "name": "Default Welcome Intent",
            "trainingPhrases": [
                "Hi",
                "Hello",
                "Hey",
                "Good morning",
                "Good evening"
            ],
            "response": "Welcome to Anurag University Student Support 🤝\nHow can I help you today?\n\nYou can ask about:\n• Admissions\n• Courses\n• Fee Structure\n• Placements\n• एग्जाम्स & Results\n• Hostel Facilities"
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
        },
        {
            "name": "Default Fallback Intent",
            "trainingPhrases": [],
            "response": "I'm sorry, I didn't understand that.\n\nYou can ask about Admissions, Courses, Fees, Placements, Results, or Hostel Facilities.\n\nFor more details visit: https://www.anurag.edu.in/"
        }
    ]
};

async function seedData() {
    console.log('Deleting old FAQs...');
    await supabase.from('faqs').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    console.log('Inserting new JSON intents...');

    const mappedFaqs = data.intents.map(intent => ({
        question: intent.trainingPhrases.join(', ') || intent.name,
        answer: intent.response,
        category: intent.name
    }));

    const { error } = await supabase.from('faqs').insert(mappedFaqs);

    if (error) {
        console.error('Failed to insert FAQs:', error);
    } else {
        console.log(`Successfully seeded ${mappedFaqs.length} intents into the knowledge base!`);
    }
}

seedData();
