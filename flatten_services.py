import json
import re

def get_sort_key(category_name_with_emoji):
    """
    Extracts the textual part of a category name for sorting,
    ignoring the leading emoji and space.
    """
    if isinstance(category_name_with_emoji, str):
        parts = category_name_with_emoji.split(" ", 1)
        if len(parts) > 1:
            return parts[1].lower() # Sort by text after emoji
        return parts[0].lower() # Fallback if no space after emoji (or no emoji)
    return ""

def main():
    try:
        with open("services.json", 'r', encoding='utf-8') as f:
            nested_services_data = json.load(f)
    except FileNotFoundError:
        print("Error: services.json not found. Cannot proceed.")
        return
    except json.JSONDecodeError:
        print("Error: services.json is not valid JSON. Cannot proceed.")
        return

    flat_services = []

    if not isinstance(nested_services_data, list):
        print("Error: services.json is not in the expected list format. Cannot proceed.")
        return

    for category_obj in nested_services_data:
        if not isinstance(category_obj, dict) or "category_name" not in category_obj or "list" not in category_obj:
            print(f"Warning: Skipping malformed category object: {category_obj}")
            continue

        category_name = category_obj["category_name"]
        service_list = category_obj["list"]

        if not isinstance(service_list, list):
            print(f"Warning: 'list' in category '{category_name}' is not a list. Skipping.")
            continue

        for service in service_list:
            if not isinstance(service, dict):
                print(f"Warning: Skipping malformed service item in category '{category_name}': {service}")
                continue

            # Create a new dictionary to avoid modifying the original while iterating (though not strictly necessary here)
            # and to ensure 'category' is added cleanly.
            flat_service = service.copy() # shallow copy is fine
            flat_service["category"] = category_name
            flat_services.append(flat_service)

    # Sort the flat list:
    # Primary key: category name (textual part, case-insensitive)
    # Secondary key: service name (case-insensitive)
    flat_services.sort(key=lambda x: (get_sort_key(x.get("category", "")), x.get("name", "").lower()))

    # Overwrite services.json with the new flat, sorted list
    try:
        with open("services.json", 'w', encoding='utf-8') as f:
            json.dump(flat_services, f, indent=2, ensure_ascii=False)
        print(f"Successfully flattened and sorted services.json. Total services: {len(flat_services)}")
    except IOError as e:
        print(f"Error writing to services.json: {e}")

if __name__ == '__main__':
    main()
