import json
import re

def get_sort_key_for_category(category_name_with_emoji):
    """
    Extracts the textual part of a category name for sorting,
    ignoring the leading emoji and space, for consistency.
    """
    if isinstance(category_name_with_emoji, str):
        # Split only on the first space to handle category names with spaces
        parts = category_name_with_emoji.split(" ", 1)
        if len(parts) > 1 and len(parts[0]) <= 2: # Assume emoji is 1 or 2 chars long
             # Check if the first part contains characters typically found in emojis
            if re.match(r'[^\w\s]', parts[0]): # Non-alphanumeric, non-whitespace
                return parts[1].lower()
        return category_name_with_emoji.lower() # Fallback if no clear emoji prefix
    return ""

def main():
    try:
        with open("services_at_parent.json", 'r', encoding='utf-8') as f:
            services_data = json.load(f)
    except FileNotFoundError:
        print("Error: services_at_parent.json not found. Please ensure it was created by the bash script.")
        # Create an empty original_categories.json to avoid downstream errors if this is considered non-fatal
        with open("original_categories.json", 'w', encoding='utf-8') as outfile:
            json.dump([], outfile, indent=2, ensure_ascii=False)
        return
    except json.JSONDecodeError:
        print("Error: services_at_parent.json is not valid JSON.")
        with open("original_categories.json", 'w', encoding='utf-8') as outfile:
            json.dump([], outfile, indent=2, ensure_ascii=False)
        return

    if not isinstance(services_data, list):
        print("Error: Data in services_at_parent.json is not a list as expected (flat structure).")
        # Attempt to handle if it's the nested structure, though problem description implies flat
        if isinstance(services_data, dict) and "categories" in services_data and isinstance(services_data["categories"], list) : # Old nested format
            print("Warning: Data seems to be in an old nested format. Attempting to extract from category_name.")
            original_categories = set()
            for category_obj in services_data["categories"]:
                 if isinstance(category_obj, dict) and "category_name" in category_obj:
                      original_categories.add(category_obj["category_name"])
        else: # Try to see if it is the new nested format
            original_categories = set()
            is_new_nested = True
            for item in services_data: # Check if all items are category objects
                if not (isinstance(item, dict) and "category_name" in item and "list" in item):
                    is_new_nested = False
                    break
            if is_new_nested:
                print("Warning: Data seems to be in the new nested format. Extracting from category_name.")
                for category_obj in services_data:
                    original_categories.add(category_obj["category_name"])
            else:
                print("Cannot determine structure of services_at_parent.json to extract categories.")
                with open("original_categories.json", 'w', encoding='utf-8') as outfile:
                    json.dump([], outfile, indent=2, ensure_ascii=False)
                return

    else: # Expected flat list structure
        original_categories = set()
        for service in services_data:
            if isinstance(service, dict) and "category" in service:
                original_categories.add(service["category"])
            else:
                print(f"Warning: Skipping service item with missing 'category' field: {service}")

    sorted_categories = sorted(list(original_categories), key=get_sort_key_for_category)

    try:
        with open("original_categories.json", 'w', encoding='utf-8') as outfile:
            json.dump(sorted_categories, outfile, indent=2, ensure_ascii=False)
        print(f"Successfully extracted {len(sorted_categories)} unique original categories to original_categories.json.")
    except IOError as e:
        print(f"Error writing to original_categories.json: {e}")

if __name__ == '__main__':
    main()
