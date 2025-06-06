import json

def sort_services_in_categories(categories_data):
    for category in categories_data:
        # Sorts services by name, case-insensitively
        category['services'].sort(key=lambda service: service['name'].strip().lower())
    return categories_data

if __name__ == '__main__':
    try:
        with open('sorted_categories.json', 'r', encoding='utf-8') as f:
            categories_data = json.load(f)
    except FileNotFoundError:
        print("Error: sorted_categories.json not found. Please ensure the previous sorting step was successful.")
        exit(1)
    except json.JSONDecodeError:
        print("Error: Could not decode JSON from sorted_categories.json.")
        exit(1)

    fully_sorted_data = sort_services_in_categories(categories_data)

    with open('final_sorted_data.json', 'w', encoding='utf-8') as outfile:
        json.dump(fully_sorted_data, outfile, indent=4)

    print("Services within each category sorted alphabetically and saved to final_sorted_data.json")
