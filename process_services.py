import json
import re
from urllib.parse import urlparse

# Define common stop words for tag generation
STOP_WORDS = set([
    "ai", "for", "and", "the", "an", "a", "of", "with", "to", "in", "on", "it", "is",
    "platform", "services", "tools", "powered", "features", "solutions", "apps", "data",
    "service", "management", "analysis", "automation", "generation", "creation",
    "based", "engine", "api", "system", "systems", "software", "applications", "app",
    "cloud", "suite", "intelligence", "intelligent", "studio", "inc", "co", "labs", "corp",
    "llc", "ltd", "(formerly", "formerly", "formerly)", "by"
])

# Emoji mapping for categories (simplified)
CATEGORY_EMOJI_MAP = {
    "3d": "🔮", "modeling": "🔮",
    "agriculture": "🌲", "farming": "🌲", "crop": "🌲",
    "all-in-one": "👽",
    "audio": "🔊", "music": "🔊", "speech": "🔊", "voice": "🔊", "sound": "🔊",
    "climate": "🌎", "weather": "🌎", "environmental": "🌎", "sustainability": "🌎", "carbon":"🌎", "energy":"💡",
    "code": "💻", "coding": "💻", "developer": "💻", "development": "💻", "programming": "💻",
    "platform": "🌐", "api": "🌐",
    "financial": "💰", "finance": "💰", "fintech": "💰", "fraud":"💰", "compliance":"💰", "regulatory":"💰",
    "game": "🎮", "gaming": "🎮",
    "google": "✨", # Specific for Google ecosystem, otherwise generic
    "health": "🩺", "healthcare": "🩺", "medical": "🩺", "drug": "🩺", "pharma":"🩺", "biotech":"🩺", "life sciences":"🩺",
    "image": "🎨", "design": "🎨", "creative": "🎨", "art": "🎨", "photo": "🎨", "visual": "🎨", "visualization": "🎨",
    "legal": "💼",
    "logistics": "📊", "supply chain": "📊", "industrial":"🏭", "manufacturing":"🏭", "robotics":"🤖", "automation":"🤖",
    "research": "🔍", "analytics": "🔍", "data analysis": "🔍", "business intelligence": "🔍",
    "retail": "🛒", "e-commerce": "🛒", "commerce": "🛒",
    "specialized": "🤖",
    "travel": "🧭", "navigation": "🧭", "maps": "🧭", "geospatial":"🧭",
    "video": "🎬", "animation": "🎬",
    "machine learning": "🧠", "mlops": "🧠", "deep learning":"🧠", "computer vision":"👁️", "nlp":"🗣️", "natural language":"🗣️",
    "text": "✍️", "writing": "✍️", "content": "✍️", "document": "✍️", "productivity": "📝",
    "search": "🔎",
    "customer service": "💬", "conversational": "💬", "chatbot": "💬", "customer experience": "💬",
    "marketing": "📈", "sales": "📈", "crm": "📈",
    "education": "🎓", "edtech": "🎓",
    "security": "🛡️", "cybersecurity": "🛡️", "privacy": "🛡️",
    "hr": "👥", "human resources": "👥", "talent": "👥", "workforce": "👥",
    "real estate": "🏠", "architectural": "🏠", "construction": "🏗️",
    "food": "🍲", "restaurant": "🍲",
    "default": "✨"
}

def normalize_text(text):
    """Lowercase and trim whitespace."""
    return text.lower().strip()

def normalize_url(url_string):
    """Lowercase, trim whitespace, and remove trailing slash for comparison."""
    if not url_string or not isinstance(url_string, str):
        return ""
    normalized = url_string.lower().strip()
    if normalized.endswith('/'):
        normalized = normalized[:-1]
    return normalized

def get_hostname(url_string):
    try:
        parsed_url = urlparse(url_string)
        if parsed_url.scheme and parsed_url.hostname:
            return parsed_url.hostname
    except Exception:
        return None
    return None

def get_favicon_url(service_url):
    """Generate favicon URL."""
    if not service_url or not isinstance(service_url, str):
        return "./favicon.ico"

    hostname = get_hostname(service_url)
    if hostname:
        # Ensure scheme for constructing favicon_url
        parsed_original_url = urlparse(service_url)
        scheme = parsed_original_url.scheme if parsed_original_url.scheme else "https"
        return f"{scheme}://{hostname}/favicon.ico"
    return "./favicon.ico"

def generate_tags(name, category_description):
    """Generate tags from service name and category description."""
    tags = set()

    # Add parts of the name
    name_parts = re.findall(r'\b\w+\b', name.lower())
    for part in name_parts:
        if part not in STOP_WORDS and len(part) > 2:
            tags.add(part)

    # Add parts of the category description (core part before parenthesis)
    core_category = category_description.split('(')[0].strip()
    category_parts = re.findall(r'\b\w+\b', core_category.lower())
    for part in category_parts:
        if part not in STOP_WORDS and len(part) > 1 : # Allow short words like "ai", "ml" if not in stop words
             # Check again if part is in STOP_WORDS because some like "ai" might be added back if not careful
            if part not in STOP_WORDS:
                 tags.add(part)

    # If category is very generic like "AI Tool Directory", add "directory"
    if "directory" in category_description.lower() and "directory" not in STOP_WORDS:
        tags.add("directory")
    if "platform" in category_description.lower() and "platform" not in STOP_WORDS:
        tags.add("platform")


    # Limit number of tags for conciseness if necessary, e.g., max 5-7 tags
    return sorted(list(tags))[:7]


def get_category_emoji(category_name):
    """Infer emoji from category name keywords."""
    lower_name = category_name.lower()
    for keyword, emoji in CATEGORY_EMOJI_MAP.items():
        if keyword in lower_name:
            return emoji
    return CATEGORY_EMOJI_MAP["default"]


def find_closest_category(new_cat_desc, existing_categories_set, existing_categories_map):
    """
    Find the closest existing category or create a new one.
    Priority:
    1. Exact match (after normalization) of the core part of new_cat_desc.
    2. Partial match if the core part of new_cat_desc is a significant substring of an existing category.
    3. If user's category like "Generative AI (details)" matches an existing "🎨 Generative AI".
    """
    new_cat_core = normalize_text(new_cat_desc.split('(')[0])

    # Direct match for normalized core
    if new_cat_core in existing_categories_map:
        return existing_categories_map[new_cat_core]

    # Attempt to match keywords within the new category description to existing categories
    # e.g. "Generative AI for images" should map to "🎨 Image Generation and Design" or "🎨 Generative AI"
    # This requires more sophisticated matching, for now, we simplify.

    best_match = None
    highest_similarity = 0.0

    # Try to find a good match based on keywords
    new_cat_keywords = set(re.findall(r'\b\w+\b', new_cat_core))

    for existing_cat_full in existing_categories_set:
        existing_cat_norm = normalize_text(existing_cat_full.split(' ', 1)[1] if ' ' in existing_cat_full else existing_cat_full) # Remove emoji for matching
        existing_cat_keywords = set(re.findall(r'\b\w+\b', existing_cat_norm))

        common_keywords = new_cat_keywords.intersection(existing_cat_keywords)
        # Simple similarity: prioritize if primary keyword matches
        # e.g. "Generative AI (...)" and "🎨 Generative AI"
        # or "Image Generation (...)" and "🎨 Image Generation and Design"

        # Check if the new_cat_core is a substring of the existing_cat_norm or vice-versa
        if new_cat_core in existing_cat_norm or existing_cat_norm in new_cat_core:
             # This is a strong signal for a match
            if len(common_keywords) > highest_similarity:
                highest_similarity = len(common_keywords)
                best_match = existing_cat_full

        # If a significant part of the new category is in an existing one.
        # Example: new_cat_core = "generative ai", existing_cat_norm = "image generation and design" -> low similarity by keywords
        # Example: new_cat_core = "generative music ai", existing_cat_norm = "audio, music, and speech" -> good similarity
        if new_cat_keywords and existing_cat_keywords: # Ensure sets are not empty
            primary_new_keyword = list(new_cat_keywords)[0] # e.g., "generative" from "generative ai"
            if primary_new_keyword in existing_cat_keywords:
                # Increase similarity score for primary keyword match
                similarity_score = len(common_keywords) + 0.5
                if similarity_score > highest_similarity:
                    highest_similarity = similarity_score
                    best_match = existing_cat_full

    if best_match and highest_similarity > 1: # Require at least some keyword overlap
        # print(f"Matched '{new_cat_desc}' to existing '{best_match}'")
        return best_match

    # If no close match, create a new category string from the new_cat_desc
    # Simplify: take the part before the first parenthesis
    simplified_new_cat = new_cat_desc.split('(')[0].strip()
    emoji = get_category_emoji(simplified_new_cat)
    final_category_name = f"{emoji} {simplified_new_cat}"
    # print(f"Creating new category for '{new_cat_desc}': '{final_category_name}'")
    return final_category_name


def main():
    try:
        with open("parsed_services.json", 'r') as f:
            new_services_parsed = json.load(f)
    except FileNotFoundError:
        print("Error: parsed_services.json not found.")
        with open("new_services_processed.json", 'w') as f:
            json.dump([], f)
        return
    except json.JSONDecodeError:
        print("Error: parsed_services.json is not valid JSON.")
        with open("new_services_processed.json", 'w') as f:
            json.dump([], f)
        return

    try:
        with open("services.json", 'r') as f:
            existing_services_data = json.load(f)
            # Ensure existing_services_data is a list of dicts
            if not isinstance(existing_services_data, list):
                 existing_services_data = [] # Or handle error appropriately

            existing_categories_set = set()
            # existing_categories_map: normalized core category -> full category string with emoji
            existing_categories_map = {}

            for service_list_obj in existing_services_data: # services.json is a list of objects, each with a "list"
                if isinstance(service_list_obj, dict) and "list" in service_list_obj:
                    for service in service_list_obj["list"]:
                        cat = service.get("category")
                        if cat:
                            existing_categories_set.add(cat)
                            # Remove emoji and normalize for mapping
                            core_cat = normalize_text(cat.split(' ', 1)[1] if ' ' in cat else cat)
                            if core_cat not in existing_categories_map: # Keep first emoji encountered for a core category
                                existing_categories_map[core_cat] = cat
                # If services.json is just a flat list of services (older format perhaps)
                elif isinstance(service_list_obj, dict) and "category" in service_list_obj:
                     cat = service_list_obj.get("category")
                     if cat:
                        existing_categories_set.add(cat)
                        core_cat = normalize_text(cat.split(' ', 1)[1] if ' ' in cat else cat)
                        if core_cat not in existing_categories_map:
                            existing_categories_map[core_cat] = cat


    except FileNotFoundError:
        print("Warning: services.json not found. Will create new categories for all services.")
        existing_services_data = []
        existing_categories_set = set()
        existing_categories_map = {}
    except json.JSONDecodeError:
        print("Error: services.json is not valid JSON. Treating as empty.")
        existing_services_data = []
        existing_categories_set = set()
        existing_categories_map = {}


    processed_services = []

    # Create sets of existing names and URLs for efficient duplicate checking
    # This needs to handle the nested structure of services.json
    existing_names_norm = set()
    existing_urls_norm = set()

    if isinstance(existing_services_data, list):
        for service_category_obj in existing_services_data:
            if isinstance(service_category_obj, dict) and "list" in service_category_obj and isinstance(service_category_obj["list"], list):
                for s in service_category_obj["list"]:
                    if isinstance(s, dict):
                        existing_names_norm.add(normalize_text(s.get("name", "")))
                        existing_urls_norm.add(normalize_url(s.get("url", "")))
            elif isinstance(service_category_obj, dict) and "name" in service_category_obj : # Flat list case
                 existing_names_norm.add(normalize_text(service_category_obj.get("name", "")))
                 existing_urls_norm.add(normalize_url(service_category_obj.get("url", "")))


    for new_service in new_services_parsed:
        name = new_service["name"]
        url = new_service["url"]
        category_desc = new_service["category_description"]

        name_norm = normalize_text(name)
        url_norm = normalize_url(url)

        # Duplicate Check
        if name_norm in existing_names_norm or (url_norm and url_norm in existing_urls_norm):
            print(f"Skipping duplicate: {name} ({url})")
            continue

        # Category Matching / Creation
        determined_category = find_closest_category(category_desc, existing_categories_set, existing_categories_map)

        # Favicon URL
        favicon_url = get_favicon_url(url)

        # Tag Generation
        tags = generate_tags(name, category_desc)

        processed_service = {
            "name": name,
            "url": url,
            "favicon_url": favicon_url,
            "category": determined_category,
            "tags": tags
        }
        processed_services.append(processed_service)

        # Add to existing sets to prevent duplicate additions from parsed_services.json itself
        existing_names_norm.add(name_norm)
        if url_norm: # only add if url_norm is not empty
            existing_urls_norm.add(url_norm)


    with open("new_services_processed.json", 'w') as f:
        json.dump(processed_services, f, indent=2)

    print(f"Processing complete. {len(processed_services)} new services written to new_services_processed.json")

if __name__ == '__main__':
    main()
