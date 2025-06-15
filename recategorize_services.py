import json

# Define the new 11 categories
NEW_CATEGORIES = [
    "🧠 Core AI Technologies",
    "🎨 Media & Generative Creativity",
    "💬 Language, Communication & Interaction",
    "💼 Enterprise & Productivity Solutions",
    "🩺 Healthcare, Biotech & Life Sciences",
    "🏭 Industry & Manufacturing",
    "🌱 Environmental, Agricultural & Climate Solutions",
    "🛡️ Security, Privacy & Governance",
    "🛒 Commerce, Retail & Logistics",
    "📚 Research, Education & Exploration",
    "🧩 Miscellaneous / Specialized"
]

# Define keywords for each new category
CATEGORY_KEYWORDS = {
    "🩺 Healthcare, Biotech & Life Sciences": ["healthcare", "medical", "health", "biotech", "life science", "drug discovery", "genomics", "pharma", "clinical", "disease", "patient", "hospital", "diagnos", "therapy", "wellness"],
    "🌱 Environmental, Agricultural & Climate Solutions": ["environ", "agri", "climate", "sustainab", "solar", "renewable", "geospatial", "earth observation", "weather", "water manage", "agritech", "farm", "harvest", "conservation", "eco", "green tech", "carbon", "emission"],
    "🏭 Industry & Manufacturing": ["industrial", "manufactur", "factory", "robotics", "automation", "supply chain", "logistics", "materials science", "engineering", "semiconductor", "automotive", "aerospace", "construction", "infrastructure", "energy", "utility", "mining", "maritime"],
    "🛒 Commerce, Retail & Logistics": ["commerce", "retail", "logistics", "e-commerce", "shopping", "delivery", "customer experience", "merchandis", "inventory", "pos", "payment", "supply chain manage", "warehouse"],
    "💼 Enterprise & Productivity Solutions": ["enterprise", "productivity", "crm", "erp", "business intelligence", "sales", "marketing", "project manage", "hr", "finance", "document ai", "office tool", "collaboration", "workflow", "meeting", "accounting", "legal tech", "legal", "insurtech", "business process", "human resources"],
    "🛡️ Security, Privacy & Governance": ["security", "privacy", "governance", "cybersecurity", "fraud", "auth", "threat detection", "compliance", "surveillance", "risk manage", "data protection", "identity manage", "legal compliance"],
    "🎨 Media & Generative Creativity": ["media", "generative", "image", "video", "music", "audio", "art", "design", "3d model", "avatar", "creative", "gaming", "entertainment", "photoshop", "adobe", "dall-e", "midjourney", "stable diffusion", "content creation", "vfx", "animation", "fashion", "writing aid", "storytelling", "content generation"],
    "💬 Language, Communication & Interaction": ["language", "communication", "interaction", "chatbot", "conversational", "assistant", "translation", "nlp", "speech", "text generation", "voice assistant", "customer support", "dialogue", "linguistic", "transcription", "natural language"],
    "📚 Research, Education & Exploration": ["research", "education", "learn", "edtech", "scientific", "exploration", "data analysis", "knowledge manage", "academic", "student", "teaching", "discovery", "library", "archive", "study tool", "courseware"],
    "🧠 Core AI Technologies": ["core ai", "machine learning", "deep learning", "neural network", "computer vision", "ai platform", "mlops", "framework", "algorithm", "data science", "model training", "inference", "artificial intelligence", "api", "sdk", "developer", "ai ethics", "expert system", "knowledge representation"],
    "🧩 Miscellaneous / Specialized": [] # Fallback
}

def get_current_categories_from_data(services_data):
    current_categories = set()
    for service in services_data:
        current_categories.add(service.get("category", "Uncategorized"))
    return list(current_categories)

def map_service_to_category(service, current_categories_keywords):
    def normalize(text):
        return text.lower() if text else ""

    s_name = normalize(service.get("name", ""))
    s_url = normalize(service.get("url", ""))
    s_category_old = normalize(service.get("category", ""))
    s_tags = [normalize(tag) for tag in service.get("tags", [])]

    search_text_parts = [s_category_old, s_name, s_url] + s_tags
    search_text = " ".join(filter(None, search_text_parts))

    scores = {cat: 0 for cat in NEW_CATEGORIES}

    for new_cat_name, keywords in current_categories_keywords.items():
        if new_cat_name == "🧩 Miscellaneous / Specialized":
            continue

        for keyword in keywords:
            if keyword in s_category_old:
                scores[new_cat_name] += 5
            if keyword in s_name:
                scores[new_cat_name] += 2
            if keyword in " ".join(s_tags):
                scores[new_cat_name] += 3
            if keyword in s_url:
                 scores[new_cat_name] +=1

    best_category = "🧩 Miscellaneous / Specialized"
    max_score = 0

    priority_order = [
        "🩺 Healthcare, Biotech & Life Sciences", "🌱 Environmental, Agricultural & Climate Solutions",
        "🏭 Industry & Manufacturing", "🛒 Commerce, Retail & Logistics",
        "💼 Enterprise & Productivity Solutions", "🛡️ Security, Privacy & Governance",
        "🎨 Media & Generative Creativity", "💬 Language, Communication & Interaction",
        "📚 Research, Education & Exploration", "🧠 Core AI Technologies"
    ]

    sorted_scores = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    if sorted_scores[0][1] > 0:
        best_category = sorted_scores[0][0]
        if sorted_scores[0][1] < 3: # If top score is very low, try priority pass
            for cat_name_priority in priority_order:
                for keyword in current_categories_keywords[cat_name_priority]:
                    if keyword in search_text: # A simple keyword match in any important field for priority categories
                        return cat_name_priority
    else: # No keyword scores from the scoring loop, try direct match on old category name (text part)
        for new_cat_name_prio in priority_order:
            new_cat_name_text_only = normalize(new_cat_name_prio.split(" ", 1)[1] if " " in new_cat_name_prio else new_cat_name_prio)
            # Ensure the text part is reasonably long to avoid overly generic matches like "AI"
            if len(new_cat_name_text_only) > 3 and new_cat_name_text_only in s_category_old :
                 return new_cat_name_prio

    return best_category

# --- Main script execution ---
try:
    with open("services.json", "r", encoding="utf-8") as f:
        services_data = json.load(f)
except FileNotFoundError:
    print("Error: services.json not found.")
    exit(1)
except json.JSONDecodeError:
    print("Error: Could not decode services.json. Check for syntax errors.")
    exit(1)

original_service_count = len(services_data)
print(f"Original number of services: {original_service_count}")

unique_services = []
seen_service_signatures = set()

for service in services_data:
    name = service.get("name", "").strip()
    url = service.get("url", "").strip()
    signature = (name, url)
    if signature not in seen_service_signatures:
        unique_services.append(service)
        seen_service_signatures.add(signature)

deduplicated_count = original_service_count - len(unique_services)
print(f"Number of duplicate services removed: {deduplicated_count}")
print(f"Number of unique services: {len(unique_services)}")
services_data = unique_services

updated_categories_count = 0
for service in services_data:
    new_category_val = map_service_to_category(service, CATEGORY_KEYWORDS)
    if service.get("category") != new_category_val:
        service["category"] = new_category_val
        updated_categories_count += 1

print(f"Updated category for {updated_categories_count} unique services.")

try:
    with open("services.json", "w", encoding="utf-8") as f:
        json.dump(services_data, f, indent=2, ensure_ascii=False)
    print(f"Successfully updated services.json. Total unique services written: {len(services_data)}")
except IOError:
    print("Error: Could not write to services.json.")
    exit(1)

final_categories_list = get_current_categories_from_data(services_data)
print(f"Final distinct categories in services.json: {len(final_categories_list)}")
print("Sample of final categories (up to 15):")
for cat_name_final in sorted(list(final_categories_list))[:15]:
    print(f"- {cat_name_final}")

valid_new_categories_set = set(NEW_CATEGORIES)
services_with_invalid_category_count = 0
for i, service_item in enumerate(services_data):
    if service_item.get("category") not in valid_new_categories_set:
        print(f"Error: Service '{service_item.get('name', 'Unknown name (index '+str(i)+')')}' has an invalid category '{service_item.get('category')}' after update.")
        services_with_invalid_category_count +=1

if services_with_invalid_category_count == 0:
    print("All unique services have been mapped to one of the 11 new valid categories successfully.")
else:
    print(f"ERROR: {services_with_invalid_category_count} services have an invalid category after the update process.")

print("Subtask for deduplication and re-categorization completed.")
