import json
import re
from collections import defaultdict

# Define common stop words for tag/keyword generation (can be expanded)
STOP_WORDS = set([
    "ai", "for", "and", "the", "an", "a", "of", "with", "to", "in", "on", "it", "is", "platform", "services",
    "tools", "powered", "features", "solutions", "apps", "data", "service", "management", "analysis",
    "automation", "generation", "creation", "based", "engine", "api", "system", "systems", "software",
    "applications", "app", "cloud", "suite", "intelligence", "intelligent", "studio", "inc", "co", "labs",
    "corp", "llc", "ltd", "by", "using", "from", "text", "image", "video", "voice", "speech", "content",
    "business", "enterprise", "platform", "technology", "solutions", "tool", "apis", "api", "sdk",
    "llms", "llm", "nlp", "ml", "deep", "learning", "models", "model", "platforms"
])

def normalize_text_for_matching(text):
    """Lowercase, remove punctuation, and split into words."""
    if not text:
        return set()
    text = text.lower()
    # Remove content in parentheses more carefully
    text = re.sub(r'\([^)]*\)', '', text)
    text = re.sub(r'[^\w\s-]', '', text)
    words = text.split()
    processed_words = set()
    for word in words:
        word = word.strip('-') # Remove leading/trailing hyphens from words like "-device"
        if word: # Ensure word is not empty after stripping
            processed_words.add(word)
            if word.endswith('s') and len(word) > 1:
                processed_words.add(word[:-1])
    return processed_words - STOP_WORDS


def get_sort_key_for_category(category_name_with_emoji):
    """Extracts the textual part of a category name for sorting."""
    if isinstance(category_name_with_emoji, str):
        parts = category_name_with_emoji.split(" ", 1)
        if len(parts) > 1 and len(parts[0]) <= 2:
             if re.match(r'[^\w\s]', parts[0]):
                return parts[1].lower()
        return category_name_with_emoji.lower()
    return ""

def find_best_original_category(service_name_for_debug, original_desc, original_categories_set):
    """Finds the best original category based on keyword overlap."""
    is_debug_service = "google assistant" in service_name_for_debug.lower()

    if is_debug_service: print(f"DEBUG: Remapping for '{service_name_for_debug}'. Original Desc: '{original_desc}'")

    if not original_desc or not original_categories_set:
        default_cat_options = ["✨ Specialized", "👽 All-in-One"] # These should be in original_categories_set based on typical content
        for dc in default_cat_options:
            if dc in original_categories_set:
                if is_debug_service: print(f"DEBUG: No original_desc or categories. Defaulting to: {dc}")
                return dc
        return list(original_categories_set)[0] if original_categories_set else "✨ Miscellaneous"

    desc_keywords = normalize_text_for_matching(original_desc)
    if is_debug_service: print(f"DEBUG: Desc Keywords: {desc_keywords}")

    if not desc_keywords:
        generic_matches = [cat for cat in original_categories_set if "general" in cat.lower() or "misc" in cat.lower() or "specialized" in cat.lower() or "all-in-one" in cat.lower()]
        if generic_matches:
            res = min(generic_matches, key=len)
            if is_debug_service: print(f"DEBUG: No desc_keywords. Generic match: {res}")
            return res
        res = list(original_categories_set)[0] if original_categories_set else "✨ Miscellaneous"
        if is_debug_service: print(f"DEBUG: No desc_keywords, no generic. Fallback: {res}")
        return res

    best_match = ""
    max_score = -1

    for orig_cat_full_name in original_categories_set:
        orig_cat_text = get_sort_key_for_category(orig_cat_full_name)
        cat_keywords = normalize_text_for_matching(orig_cat_text)

        common_keywords = desc_keywords.intersection(cat_keywords)
        score = len(common_keywords)

        # Bonus for direct match of the main part of the original description
        core_original_desc = original_desc.split('(')[0].strip()
        normalized_core_original_desc_keywords = normalize_text_for_matching(core_original_desc)

        if normalized_core_original_desc_keywords == cat_keywords and cat_keywords : # Check if cat_keywords is not empty
            score += 10
            if is_debug_service: print(f"DEBUG: Exact core match bonus for '{orig_cat_full_name}'")


        if is_debug_service and score > 0:
            print(f"DEBUG: Candidate: '{orig_cat_full_name}', Score: {score}, Common: {common_keywords}")

        if score > max_score:
            max_score = score
            best_match = orig_cat_full_name
        elif score == max_score and best_match:
            if len(orig_cat_full_name) < len(best_match): # Prefer shorter category names on tie
                best_match = orig_cat_full_name

    if not best_match or max_score == 0:
        default_cat_options = ["👽 All-in-One", "🤖 Specialized"]
        for dc_option in default_cat_options:
            if dc_option in original_categories_set:
                if is_debug_service: print(f"DEBUG: No score or best_match. Defaulting to: {dc_option}")
                return dc_option
        if original_categories_set:
            res = list(original_categories_set)[0]
            if is_debug_service: print(f"DEBUG: No score or best_match. Fallback to first original: {res}")
            return res
        # This case should not be reached if original_categories_set is not empty
        if is_debug_service: print(f"DEBUG: Critical fallback! No categories matched, original_categories_set might be empty.")
        return "✨ Miscellaneous" # Fallback, though this category might not be "original"

    if is_debug_service: print(f"DEBUG: Final best match for '{service_name_for_debug}': {best_match} with score {max_score}")
    return best_match


def main():
    try:
        with open("services.json", 'r', encoding='utf-8') as f:
            current_services = json.load(f)
    except FileNotFoundError:
        print("Error: services.json not found.")
        return
    except json.JSONDecodeError:
        print("Error: services.json is not valid JSON.")
        return

    try:
        with open("original_categories.json", 'r', encoding='utf-8') as f:
            original_category_names = json.load(f)
        original_categories_set = set(original_category_names)
        if not original_categories_set:
            print("Error: original_categories.json is empty or invalid.")
            return
    except FileNotFoundError:
        print("Error: original_categories.json not found.")
        return
    except json.JSONDecodeError:
        print("Error: original_categories.json is not valid JSON.")
        return

    try:
        with open("parsed_services.json", 'r', encoding='utf-8') as f:
            parsed_services_list = json.load(f)
    except FileNotFoundError:
        print("Error: parsed_services.json not found.")
        return
    except json.JSONDecodeError:
        print("Error: parsed_services.json is not valid JSON.")
        return

    parsed_services_lookup = {}
    for service in parsed_services_list:
        name_norm = service.get("name", "").lower().strip()
        url_val = service.get("url", "")
        if not isinstance(url_val, str): url_val = ""
        url_norm = url_val.lower().strip()
        if url_norm.endswith('/'):
            url_norm = url_norm[:-1]

        if name_norm or url_norm:
             parsed_services_lookup[(name_norm, url_norm)] = service["category_description"]


    final_services_list = []
    remapped_count = 0
    unmapped_but_kept_count = 0

    for service in current_services:
        current_category = service.get("category")
        service_name = service.get("name", "Unknown")

        if current_category in original_categories_set:
            final_services_list.append(service)
        else:
            name_norm = service_name.lower().strip()
            url_val = service.get("url", "")
            if not isinstance(url_val, str): url_val = ""
            url_norm = url_val.lower().strip()
            if url_norm.endswith('/'):
                url_norm = url_norm[:-1]

            original_desc = parsed_services_lookup.get((name_norm, url_norm))

            if original_desc:
                best_original_category = find_best_original_category(service_name, original_desc, original_categories_set)
                service["category"] = best_original_category
                final_services_list.append(service)
                remapped_count += 1
            else:
                print(f"Warning: Could not find original description for '{service_name}' in new category '{current_category}'. Assigning to a default original category.")
                default_cat = list(original_categories_set)[0] if original_categories_set else "✨ Miscellaneous"
                # Attempt to find a sensible default from original categories
                sensible_defaults = ["👽 All-in-One", "🤖 Specialized"] # These are in original_categories.json
                for sd_cat in sensible_defaults:
                    if sd_cat in original_categories_set:
                        default_cat = sd_cat
                        break
                service["category"] = default_cat
                final_services_list.append(service)
                unmapped_but_kept_count +=1
                remapped_count +=1

    final_services_list.sort(key=lambda x: (get_sort_key_for_category(x.get("category", "")), x.get("name", "").lower()))

    with open("remapped_services.json", 'w', encoding='utf-8') as f:
        json.dump(final_services_list, f, indent=2, ensure_ascii=False)

    print(f"Processing complete. Total services in remapped_services.json: {len(final_services_list)}.")
    print(f"Number of services re-mapped to original categories: {remapped_count}.")
    if unmapped_but_kept_count > 0:
        print(f"Warning: {unmapped_but_kept_count} services could not retrieve their original description and were mapped to a default original category.")

if __name__ == '__main__':
    main()
