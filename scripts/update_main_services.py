import json
from collections import defaultdict

def main():
    try:
        with open("services.json", 'r') as f:
            existing_services_data = json.load(f)
    except FileNotFoundError:
        print("Warning: services.json not found. Starting with an empty list of categories.")
        existing_services_data = []
    except json.JSONDecodeError:
        print("Error: services.json is not valid JSON. Cannot proceed.")
        return

    try:
        with open("new_services_processed.json", 'r') as f:
            new_services_list = json.load(f)
    except FileNotFoundError:
        print("Info: new_services_processed.json not found. No new services to add.")
        new_services_list = []
    except json.JSONDecodeError:
        print("Error: new_services_processed.json is not valid JSON. Cannot proceed.")
        return

    if not new_services_list:
        print("No new services to add. services.json will be re-sorted if it exists and is not empty.")
        # Even if no new services, we should re-sort the existing data to ensure consistency
        # if existing_services_data is already in the desired structure.

    # The existing services.json is a list of category objects.
    # Each object is: {"category_name": "Category X", "list": [services]}
    # We need to merge new services into this structure.

    # Create a dictionary to hold categories for easy access and modification
    categories_map = defaultdict(list)

    # Populate from existing services.json
    if isinstance(existing_services_data, list):
        for category_obj in existing_services_data:
            if isinstance(category_obj, dict) and "category_name" in category_obj and "list" in category_obj:
                categories_map[category_obj["category_name"]].extend(category_obj["list"])
            else:
                # Handle case where services.json might be a flat list (older format or error)
                # For this script, we'll assume it should be category objects.
                # If items are service objects directly, try to group them.
                if isinstance(category_obj, dict) and "category" in category_obj and "name" in category_obj:
                     categories_map[category_obj["category"]].append(category_obj)


    # Add new services to the map
    for service in new_services_list:
        category_name = service["category"] # This is the full category string like "✨ Generative AI"
        # The service object already has 'name', 'url', 'favicon_url', 'category', 'tags'
        # We just need to remove the 'category' field from the service object itself if it's stored under category_name
        service_entry = {
            "name": service["name"],
            "url": service["url"],
            "favicon_url": service["favicon_url"],
            "tags": service["tags"]
        }
        # Add thumbnail_url only if it exists, otherwise omit
        if "thumbnail_url" in service and service["thumbnail_url"]:
            service_entry["thumbnail_url"] = service["thumbnail_url"]

        categories_map[category_name].append(service_entry)

    # Reconstruct the list of category objects, sorted
    updated_services_data = []
    sorted_category_names = sorted(categories_map.keys())

    for category_name in sorted_category_names:
        services_in_category = categories_map[category_name]
        # Sort services within this category by name (case-insensitive)
        sorted_services = sorted(services_in_category, key=lambda x: x["name"].lower())

        # Deduplicate services within the same category list based on name and URL after sorting
        # This is a secondary deduplication, primary was in process_services.py
        final_services_in_category = []
        seen_service_signatures = set()
        for srv in sorted_services:
            # Normalize name and URL for signature
            norm_name = srv["name"].lower().strip()
            # Ensure 'url' key exists and is a string before normalizing
            url_val = srv.get("url", "")
            if not isinstance(url_val, str):
                url_val = ""
            norm_url = url_val.lower().strip()

            if norm_url.endswith('/'):
                norm_url = norm_url[:-1]

            signature = (norm_name, norm_url)
            if signature not in seen_service_signatures:
                final_services_in_category.append(srv)
                seen_service_signatures.add(signature)

        if final_services_in_category: # Only add category if it has services
            updated_services_data.append({
                "category_name": category_name,
                "list": final_services_in_category
            })

    # Overwrite services.json
    with open("services.json", 'w') as f:
        json.dump(updated_services_data, f, indent=2, ensure_ascii=False) # ensure_ascii=False for emojis

    print(f"Successfully updated services.json. Total categories: {len(updated_services_data)}")

if __name__ == '__main__':
    main()
